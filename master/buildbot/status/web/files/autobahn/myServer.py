import json
import logging
import sys
from threading import Lock, Thread
import urllib2
import time
from twisted.web.client import Agent
from twisted.internet import reactor
from twisted.python import log
from twisted.web.server import Site
from twisted.web.static import File
from autobahn.websocket import WebSocketServerFactory, WebSocketServerProtocol, listenWS

PORT = 8010
POLL_INTERVAL = 5
updateLock = Lock()

agent = Agent(reactor)

def dict_compare(d1, d2):
    d1_keys = set(d1.keys())
    d2_keys = set(d2.keys())
    intersect_keys = d1_keys.intersection(d2_keys)
    added = d1_keys - d2_keys
    removed = d2_keys - d1_keys
    modified = {o : (d1[o], d2[o]) for o in intersect_keys if d1[o] != d2[o]}
    same = set(o for o in intersect_keys if d1[o] == d2[o])
    return added, removed, modified, same


class CachedURL():
    def __init__(self, url):
        self.url = url
        self.cachedJSON = None
        self.clients = []
        self.lastChecked = 0
        self.errorCount = 0

    def pollNeeded(self):
        return (time.time() - self.lastChecked) > POLL_INTERVAL

class BroadcastServerProtocol(WebSocketServerProtocol):
    def onOpen(self):
        self.factory.register(self)

    def onMessage(self, msg, binary):
        if not binary:
            self.factory.clientMessage(msg, self)

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


class BroadcastServerFactory(WebSocketServerFactory):
    """
    Checks given JSON URLs by clients and broadcasts back to them
    if the JSON has changed
    """

    def __init__(self, url, debug=False, debugCodePaths=False):
        WebSocketServerFactory.__init__(self, url, debug=debug, debugCodePaths=debugCodePaths)
        self.urlCacheDict = {}
        self.clients = []
        self.tickcount = 0
        self.clients_urls = {}
        self.tick()

    def jsonChanged(self, json, cachedJSON):
        if cachedJSON is None:
            return True
        else:
            added, removed, modified, same = dict_compare(json, cachedJSON)
            if len(added) > 0 or len(removed) > 0 or len(modified) > 0:
                return True

        return False

    def tick(self):
        self.tickcount += 1
        self.checkURLs()
        reactor.callLater(1, self.tick)

    def checkURLs(self):
        threads = []
        for urlCache in self.urlCacheDict.values():
            #Thread each of these
            p = Thread(target=self.checkURL, args=(urlCache, ))
            p.start()
            threads.append(p)

        for t in threads:
            t.join()

    def checkURL(self, urlCache):
        url = urlCache.url
        if self.urlCacheDict[url].errorCount > 5:
            logging.info("Removing cached URL as it has too many errors")
            del self.urlCacheDict[url]
            return
        if urlCache.pollNeeded():
            updateLock.acquire()
            try:
                logging.info("Polling: {0}".format(url))
                response = urllib2.urlopen(url, timeout=POLL_INTERVAL-1)
                jsonObj = json.load(response)
                urlCache.lastChecked = time.time()
                if self.jsonChanged(jsonObj, self.urlCacheDict[url].cachedJSON):
                    self.urlCacheDict[url].cachedJSON = jsonObj
                    clients = self.urlCacheDict[url].clients
                    jsonString = json.dumps(jsonObj)
                    logging.info("JSON Changed, informing {0} client(s)".format(len(clients)))
                    for client in clients:
                        client.sendMessage(jsonString)
            except Exception as e:
                logging.error(e)
                self.urlCacheDict[url].errorCount += 1
            finally:
                updateLock.release()

    def register(self, client):
        if not client in self.clients:
            logging.info("registered client " + client.peerstr)
            self.clients.append(client)

    def unregister(self, client):
        if client in self.clients:
            logging.info("unregistered client " + client.peerstr)
            self.clients.remove(client)
            for items in self.urlCacheDict.items():
                url = items[0]
                urlCache = items[1]
                if client in urlCache.clients:
                    urlCache.clients.remove(client)

                if len(urlCache.clients) == 0:
                    del self.urlCacheDict[url]
                    logging.info("Removed stale cached URL")

                break

    def clientMessage(self, msg, client):
        if msg.startswith("http://"):
            if not msg in self.urlCacheDict:
                self.urlCacheDict[msg] = CachedURL(msg)
                self.urlCacheDict[msg].clients = [client, ]
            else:
                self.urlCacheDict[msg].clients.append(client)

            if self.urlCacheDict[msg].cachedJSON is not None:
                jsonString = json.dumps(self.urlCacheDict[msg].cachedJSON)
                logging.info("Sending cached JSON to client {0}".format(client.peerstr))
                client.sendMessage(jsonString)


def createDeamon():
    import os, sys
    fpid = os.fork()
    if fpid is not 0:
        f = open('myServer.pid','w')
        f.write(str(fpid))
        f.close()
        sys.exit(0)

if __name__ == '__main__':

    if len(sys.argv) > 1 and sys.argv[1] == 'debug':
        log.startLogging(sys.stdout)
        debug = True
    elif len(sys.argv) > 1 and sys.argv[1] == 'daemon':
        createDeamon()
        debug = False
    else:
        debug = False

    logFormat = '%(asctime)s %(levelname)s: %(message)s'
    dateFormat = '%m/%d/%Y %I:%M:%S %p'
    logging.basicConfig(format=logFormat, filename='myServer.log', level=logging.INFO, datefmt=dateFormat)

    if len(sys.argv) == 1 or (len(sys.argv) > 1 and sys.argv[1] != 'daemon'):
        #Add console logging
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        formatter = logging.Formatter(logFormat, datefmt=dateFormat)
        console.setFormatter(formatter)
        logging.getLogger('').addHandler(console)

    ServerFactory = BroadcastServerFactory

    factory = ServerFactory("ws://localhost:{0}".format(PORT),
                            debug=debug,
                            debugCodePaths=debug)

    factory.protocol = BroadcastServerProtocol
    factory.setProtocolOptions(allowHixie76=True)
    listenWS(factory)

    webdir = File(".")
    web = Site(webdir)
    reactor.listenTCP(8080, web)

    logging.info("Starting autobahn server on port {0}".format(PORT))
    reactor.run()