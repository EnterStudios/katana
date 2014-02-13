define(["screensize"],function(e){var t;return t={init:function(){t.setCurrentItem(),t.authorizeUser(),$("#buildslave_page").length&&t.displaySum($("#currentJobs"),$("#runningBuilds_onBuildslave li")),$("#builddetail_page").length>0&&t.summaryArtifactTests(),$("#tb-root").length!=0,t.menuItemWidth(e.isMediumScreen()),$(window).resize(function(){t.menuItemWidth(e.isMediumScreen())}),t.selectBuildsAction(),$(function(){var t=/chrome/.test(navigator.userAgent.toLowerCase()),n=navigator.platform.toUpperCase().indexOf("WIN")!==-1;t&&n&&$("body").addClass("chrome win")}),t.toolTip(".ellipsis-js"),t.parseReasonString(),t.runIndividualBuild(),t.setFullName($("#buildForm .full-name-js, #authUserName")),$("#authUserBtn").click(function(e){t.eraseCookie("fullName1","","eraseCookie")})},authorizeUser:function(){var e=window.location;if(e.search.match(/user=/)&&e.search.match(/autorized=True/)){var n=decodeURIComponent(e.search.split("&").slice(0)[1].split("=")[1]);t.setCookie("fullName1",n),window.location="/"}else t.getCookie("fullName1")===""?window.location="/login":t.setCookie("fullName1",t.getCookie("fullName1"))},setCurrentItem:function(){var e=window.location.pathname.split("/");$(".top-menu a").each(function(t){var n=this.href.split("/");(this.id==e[1].trim().toLowerCase()||this.id=="home"&&e[1].trim().toLowerCase().length===0)&&$(this).parent().addClass("selected")})},jCenter:function(e){var t=$(window).height(),n=$(window).width(),r=e.outerHeight(),i=e.outerWidth();return e.css("position","absolute"),t<r?e.css("top",(t-r+(r-t)+10)/2+$(window).scrollTop()+"px"):e.css("top",(t-r)/2+$(window).scrollTop()+"px"),e.css("left",(n-i)/2+$(window).scrollLeft()+"px"),e},setFullName:function(e){var n,r=t.getCookie("fullName1");e.each(function(){n=$(this).is("input")?"val":"text",$(this)[n](r)})},runIndividualBuild:function(){$(".run-build-js").click(function(e){$(".remove-js").remove(),e.preventDefault();var n=$(this).prev(),r=n.attr("data-b"),i=n.attr("data-indexb"),s=n.attr("data-returnpage"),o='<div id="bowlG"><div id="bowl_ringG"><div class="ball_holderG"><div class="ballG"></div></div></div></div>',u=$(this).prev().attr("data-b_name");$("body").append(o).show();var a=location.protocol+"//"+location.host+"/forms/forceBuild",f={rt_update:"extforms",datab:r,dataindexb:i,builder_name:u,returnpage:s},l=window.location.search.substring(1),c=l.split("&");$.each(c,function(e,t){var n=t.split("=");n[0].indexOf("_branch")>=0&&(f[n[0]]=n[1],console.log(t))}),$.get(a,f).done(function(e){$("#bowlG").remove();var n=$("<div/>").attr("id","formCont").append($(e)).appendTo("body").hide();t.setFullName($("#usernameDisabled, #usernameHidden",n)),$(".command_forcebuild",n).submit()})})},parseReasonString:function(){$(".codebases-list .reason-txt").each(function(){var e=$(this).text().trim();e==="A build was forced by '':"&&$(this).remove()})},selectBuildsAction:function(){$("#selectall").click(function(){$(".fi-js").prop("checked",this.checked)}),$("#submitBtn").click(function(){$("#formWrapper form").submit()}),$(".force-individual-js").click(function(e){e.preventDefault();var t=$(this).prev().prev().val(),n=$('<input checked="checked" name="cancelselected" type="hidden" value="'+t+'"  />');$(n).insertAfter($(this)),$("#formWrapper form").submit()})},updateBuilders:function(){$.ajax({url:"/json/builders/?filter=0",dataType:"json",type:"GET",cache:!1,success:function(e){function i(e){var t=0;return $.each(e,function(){t+=parseFloat(this)||0}),t}var t=[],n=[],r=[];$.each(e,function(e,i){t.push(e),n.push(i.pendingBuilds),i.state=="building"&&r.push(i.currentBuilds)}),$("#pendingBuilds").text(i(n))}}),$.ajax({url:"/json/slaves/?filter=0",dataType:"json",type:"GET",cache:!1,success:function(e){var t=[];$.each(e,function(e){t.push(e)}),$("#slavesNr").text(t.length)}})},codeBaseBranchOverview:function(){var e=decodeURIComponent(window.location.search),t=e.split("&"),n=$('<div class="border-table-holder"><div id="overScrollJS" class="inner-table-holder"><table class="codebase-branch-table"><tr class="codebase"><th>Codebase</th></tr><tr class="branch"><th>Branch</th></tr></table></div></div>');$(n).insertAfter($(".dataTables_filter")),$(t).each(function(e){var t=this.split("=");if(t[0].indexOf("_branch")>0){var n=this.split("_branch")[0];e==0&&(n=this.replace("?","").split("_branch")[0]);var r=this.split("=")[1];$("tr.codebase").append("<td>"+n+"</td>"),$("tr.branch").append("<td>"+r+"</td>")}})},menuItemWidth:function(e){if(e){var t=0;$(".breadcrumbs-nav li").each(function(){t+=$(this).outerWidth()}),$(".breadcrumbs-nav").width(t+100)}else $(".breadcrumbs-nav").width("")},toolTip:function(e){$(e).parent().hover(function(){var t=$(e,this).attr("data-txt"),n=$("<div/>").addClass("tool-tip").text(t);$(this).append($(n).css({top:$(e,this).position().top-10,left:$(e,this).position().left-20}).show())},function(){$(".tool-tip").remove()}),$(document).bind("click touchstart",function(e){$(".tool-tip").remove(),$(this).unbind(e)})},displaySum:function(e,t){e.text(t.length)},summaryArtifactTests:function(){var e=$("li.artifact-js").clone(),t=$("#showArtifactsJS"),n=$("#noArtifactsJS");e.length>0?t.show().text("("+e.length+") Artifacts ").next().find(".builders-list").append(e):n.show();var r=$(".s-logs-js").clone(),i=$("#testsListJS"),s=[];$(r).each(function(){var e=$(this).text().split(".").pop();(e==="xml"||e==="html")&&s.push($(this))}),s.length>0&&(i.append($("<li>Test Results</li>")),i.append(s))},setCookie:function(e,t,n){var r=new Date,i=new Date(r.getTime()+2592e6);if(n===undefined)var s=i.toGMTString();else var s="Thu, 01 Jan 1970 00:00:00 GMT;";document.cookie=e+"="+encodeURI(t)+"; path=/; expires="+s},getCookie:function(e){var t=new RegExp(e+"=([^;]+)"),n=t.exec(document.cookie);return n!=null?decodeURI(n[1]):""},eraseCookie:function(e,n,r){t.setCookie(e,n,r)},closePopup:function(e,t){$(document,".close-btn").bind("click touchstart",function(n){if(!$(n.target).closest(e).length||$(n.target).closest(".close-btn").length)t===undefined?e.remove():e.slideUp("fast",function(){$(this).remove()}),$(this).unbind(n)})}},t});