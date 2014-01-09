define(['jquery', 'helpers'], function ($, helpers) {
         "use strict";
    var realtimeRouting;
    
    realtimeRouting = {
        init: function () {
        	switch(helpers.getCurrentPage())
			{ 
			case 'builddetail':        	
				// For the builddetailpage
				require(['rtbuilddetail'],
		        function(rtBuildDetail) {
		        	rtBuildDetail.init();
		        });
		      	break;
			
			case 'builders':							
				// For the builderspage
				require(['rtbuilders'],
		        function(rtBuilders) {
		        	rtBuilders.init();
		        });
		       break;

		    case 'frontpage':							
				// For the frontpage
				require(['rtfrontpage'],
		        function(rtFrontpage) {
		        	rtFrontpage.init();
		        });
		       break;
			}
		}

	};
   return realtimeRouting
});


