// Override Settings
var boostPFSInstantSearchConfig = {
	search: {
		//suggestionMode: 'test',
		//suggestionPosition: 'left'
//       	suggestionMobileStyle: "style2"
	}
};

(function() {
	BoostPFS.inject(this);

    var bindEvents = InstantSearchMobile.prototype.bindEvents;

    InstantSearchMobile.prototype.bindEvents = function() {
      bindEvents.call(this);

      var self = this;

      // Change here the class of your button
      jQ('#desk-search-icon, #mob-search-icon').on("click" , function(e) {
        e.stopPropagation();
        e.preventDefault();
        self.openSuggestionMobile()
      });
    }

	// Customize style of Suggestion box
	SearchInput.prototype.customizeInstantSearch = function() {
		var suggestionElement = this.$uiMenuElement;
		var searchElement = this.$element;
		var searchBoxId = this.id;
	};

  	// Boost #98034
	if($(window).width() > 1100) {
		jQ('form[action="/search"]').find('button').attr('disabled','disabled');
	}

	jQ('input[name="q"]').on( "input", function(e) {
		if(jQ(this).val() !== '' && !isEmpty(jQ(this).val())){
			jQ(this).parent().find('button').removeAttr('disabled');
		}else{
			jQ(this).parent().find('button').attr('disabled','disabled');
		}
	});

	jQ('input[name="q"]').on( "keydown", function(e) {
		var c = e.which ? e.which : e.keyCode;
		if(c == 13 && !jQ(this).val() || c == 13 && isEmpty(jQ(this).val())){
			e.preventDefault();
			return false;
		}
	});

	function isEmpty(str) {
		return str.replace(/^\s+|\s+$/gm,'').length == 0;
	}
	// End Boost #98034

    // Start Boost #175363
    if(location.search !== '' && location.search.includes('?view=boost-pfs-original')){
      // console.log('include boost-original');
      jQ('head').append('<meta name="robots" content="noindex,nofollow,nosnippet">');
    }
    // End Boost #175363
  
})();