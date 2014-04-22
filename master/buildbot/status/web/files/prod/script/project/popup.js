define(["helpers","libs/jquery.form","text!templates/popups.mustache","mustache","timeElements"],function(e,t,n,r,i){var s;return s={init:function(){var t=$("#tablesorterRt");t.delegate("a.popup-btn-json-js","click",function(e){e.preventDefault(),s.showjsonPopup($(this).data()),i.updateTimeObjects()}),$(".popup-btn-js-2").click(function(e){e.preventDefault(),s.nonAjaxPopup($(this))}),t.delegate(".popup-btn-js","click",function(t){t.preventDefault();var n=document.URL,r=document.createElement("a");r.href=n;var i=encodeURIComponent($(this).attr("data-builderName")),o="{0}//{1}/json/pending/{2}/?".format(r.protocol,r.host,i),u=e.codebasesFromURL({}),a=e.urlParamsToString(u);s.pendingJobs(o+a)}),$("#getBtn").click(function(e){e.preventDefault(),s.codebasesBranches()}),t.delegate(".ajaxbtn","click",function(e){e.preventDefault(),s.externalContentPopup($(this))}),$(".ajaxbtn").click(function(e){e.preventDefault(),s.externalContentPopup($(this))})},showjsonPopup:function(t){var i=r.render(n,t),s=$(r.render(n,{MoreInfoBoxOuter:!0},{partial:i}));$("body").append(s),t.showRunningBuilds!=undefined&&e.delegateToProgressBar($("div.more-info-box-js div.percent-outer-js")),e.jCenter(s).fadeIn("fast",function(){e.closePopup(s)})},validateForm:function(e){var t=$(".command_forcebuild",e),i=":button, :hidden, :checkbox, :submit";$(".grey-btn",t).click(function(e){var s=$("input",t).not(i),o=s.filter(function(){return this.name.indexOf("revision")>=0}),u=o.filter(function(){return this.value===""});if(u.length>0&&u.length<o.length){o.each(function(){$(this).val()===""?$(this).addClass("not-valid"):$(this).removeClass("not-valid")}),$(".form-message",t).hide();if(!$(".error-input",t).length){var a=r.render(n,{errorinput:"true",text:"Fill out the empty revision fields or clear all before submitting"}),f=$(a);$(t).prepend(f)}e.preventDefault()}})},nonAjaxPopup:function(t){var n=t.next($(".more-info-box-js")).clone();n.appendTo($("body")),e.jCenter(n).fadeIn("fast",function(){e.closePopup(n)}),$(window).resize(function(){e.jCenter(n)})},pendingJobs:function(t){var s=r.render(n,{preloader:"true"}),o=$(s);$("body").append(o).show();var u=document.URL,a=document.createElement("a");a.href=u;var f=a.protocol+"//"+a.host+a.pathname;$.ajax({url:t,cache:!1,dataType:"json",success:function(t){o.remove();var s=r.render(n,{pendingJobs:t,showPendingJobs:!0,cancelAllbuilderURL:t[0].builderURL}),u=$(r.render(n,{MoreInfoBoxOuter:!0},{partial:s})),a=u.find(".waiting-time-js");a.each(function(e){i.addElapsedElem($(this),t[e].submittedAt),i.updateTimeObjects()}),u.appendTo("body"),e.jCenter(u).fadeIn("fast",function(){e.closePopup(u)})}})},codebasesBranches:function(){var t=$("#pathToCodeBases").attr("href"),i=r.render(n,{preloader:"true"}),o=$(i);$("body").append(o).show();var u=s.htmlModule("Select branches");$(u).appendTo("body"),$.get(t).done(function(t){require(["selectors"],function(n){var r=$("#content1");o.remove();var i=$(t).find("#formWrapper");i.children("#getForm").attr("action",window.location.href);var s=i.find('.blue-btn[type="submit"]').val("Update");i.appendTo(r),e.jCenter(u).fadeIn("fast",function(){n.init(),s.focus(),e.closePopup(u)}),$(window).resize(function(){e.jCenter(u)})})})},customTabs:function(){$(".tabs-list li").click(function(e){var t=$(this).index();$(this).parent().find("li").removeClass("selected"),$(this).addClass("selected"),$(".content-blocks > div").each(function(e){$(this).index()!=t?$(this).hide():$(this).show()})})},externalContentPopup:function(t){var i=t.attr("data-popuptitle"),o=t.attr("data-b"),u=t.attr("data-indexb"),a=t.attr("data-returnpage"),f=t.attr("data-rt_update"),l=t.attr("data-contenttype"),c=t.attr("data-b_name"),h=r.render(n,{preloader:"true"}),p=$(h),d='<h2 class="small-head">Your build will show up soon</h2>',v=$(r.render(n,{MoreInfoBoxOuter:!0},{partial:d})),m=$("body");m.append(p);var g=s.htmlModule(i);g.appendTo(m);var y={rt_update:f,datab:o,dataindexb:u,builder_name:c,returnpage:a},b=window.location.search.substring(1),w=b.split("&");$.each(w,function(e,t){var n=t.split("=");n[0].indexOf("_branch")>=0&&(y[n[0]]=n[1])});var E=location.protocol+"//"+location.host+"/forms/forceBuild";$.get(E,y).done(function(t){var n=$("#content1");p.remove(),$(t).appendTo(n),e.tooltip(n.find($(".tooltip"))),l==="form"&&(e.setFullName($("#usernameDisabled, #usernameHidden",n)),s.validateForm(n)),e.jCenter(g).fadeIn("fast"),$(window).resize(function(){e.jCenter(g)}),e.closePopup(g),a!==undefined&&n.find("form").ajaxForm({beforeSubmit:function(){m.append(v),e.jCenter(v).fadeIn("fast",function(){e.closePopup($(this)),$(this).delay(1500).fadeOut("fast",function(){$(this).remove()})}),n.closest(".more-info-box").find(".close-btn").click()},success:function(e){requirejs(["realtimePages"],function(t){v.remove();var n=a.replace("_json","");t.updateSingleRealTimeData(n,e)})}})})},htmlModule:function(e){var t=$('<div class="more-info-box remove-js"><span class="close-btn"></span><h3 class="codebases-head">'+e+"</h3>"+'<div id="content1"></div></div>');return t}},s});