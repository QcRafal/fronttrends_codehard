$(function(){

  var getOffsetTop = function(obj){
    offsetTop = obj.offsetTop;
    var parentEl = obj.offsetParent;
    while (parentEl!==null){
      offsetTop = offsetTop + parentEl.offsetTop;
      parentEl = parentEl.offsetParent;
    }
    return offsetTop;
  };

  var Challenge = {

    start: function(){
      this.navigate();
      this.parallax();
      this.system();
      this.twitter();
      this.shadowbox();
      this.formsetup();
    },

    navigate: function(){
      $('.nav a').each(function(){
          var top = getOffsetTop($($(this).attr('href'))[0]);
          $(this).smoothScroll({
            offset: -15,
            speed: 400*(top/900)
          });
        });
      $('.go-top').each(function(){
          var top = getOffsetTop($(this)[0]);
          $(this).smoothScroll({
            offset: -40,
            speed: 400*(top/900)
          });
        });
    },

    system: function(){
      $('html').addClass(System.os);
    },

    twitter: function(){
      getTwitters('latest-tweets', {
        id: 'oyahero',
        count: 2,
        enableLinks: true,
        ignoreReplies: true,
        clearContents: true,
        template: '<span>%text%</span> <a href="http://twitter.com/%user_screen_name%/statuses/%id_str%/" class="datetime">%time%</a>'
      });
    },

    parallax: function(){
      function elementInViewport(el) {
        var rect = el.getBoundingClientRect();
        console.log("Bounding rect: ", rect);

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth 
        );
      }

      // cache elems for performance
      var clouds = [
        {el: $('.cloud-1'), offset: 100, factor: 1.1},
        {el: $('.cloud-3'), offset: 550, factor: 1.6},
        {el: $('.cloud-5'), offset: 1300, factor: 1.9},
        {el: $('.cloud-7'), offset: 2000, factor: 1.3},
        {el: $('.cloud-9'), offset: 2650, factor: 1.8},
        {el: $('.cloud-11'), offset: 3300, factor: 1.8},
        {el: $('.cloud-13'), offset: 4000, factor: 1.6},
        {el: $('.cloud-17'), offset: 5200, factor: 1.6},
        {el: $('.cloud-19'), offset: 5800, factor: 1.2},
        {el: $('.cloud-19'), offset: 5800, factor: 1.5},
        {el: $('.cloud-21'), offset: 6400, factor: 1.7},
        {el: $('.cloud-23'), offset: 7000, factor: 1.9},
        {el: $('.cloud-25'), offset: 7600, factor: 1.9}
      ];

      function moveClouds(offset) {
        for (var i= 0; i < clouds.length; i++) {
          var obj = clouds[i];
          obj.el.css('top', obj.offset - (offset * obj.factor));
        }
      }
      
      $(window).scroll(function(){
        var $offset = $(window).scrollTop();

        moveClouds($offset);

        $('#oyahero').css({
          top: 650 - $offset * 1.1,
          left: 570 + $offset * 1.5
        });
        // just position when within visual range

        $('#oyahero2').css({
          top: 3150 - $offset * 1.4,
          left: 3300 - $offset * 1.5
        });
      });
    },

    shadowbox: function(){
      Shadowbox.init();
    },

    formsetup: function() {
      $('form.paingame')
        .bind('submit', function(e) {
          e.preventDefault();

          /**
           * @todo Validate emailAddress and realName
           */
          var aHero = new Models.CodeHero({
            email: $(this).find('input[name="email"]').val(),
            nickname: $(this).find('input[name="twitter"]').val(),
            nicknameIsTwitterAccount: true,
            aknowledgeGameRisk: ($(this).find('input[name="risk"]:checked').length > 0),
            receiveJobOffers: ($(this).find('input[name="newsletter"]:checked').length > 0)
          });
          aHero.on('sync', function() {
            $('.register-now fieldset').hide();
            $('.register-now fieldset.thankyou').show().find('h2').hide().fadeIn();
          });

          aHero.save();
        });

      Models.CodeHardRequest = Backbone.Model.extend({
        urlRoot: '/api/codechallenge',
        idAttribute: "_id",
        validate: function(attrs) {
          if (!attrs.email) {
            return 'You need to fill in e-mail';
          }
        }
      });

      console.log("Binding to ", $('form.codehard'));
      $('form.codehard')
        .bind('submit', function(e) {
          e.preventDefault();

          var request = new Models.CodeHardRequest({
            email: $(this).find('input').val()
          });
          console.log("Saving model", request);
          request.on('sync', function() {
            $('.code-hard fieldset').hide();
            $('.code-hard fieldset.thankyou').show().find('h2').hide().fadeIn();
          });
          request.save();
        });
    }

  };

  Challenge.start();
});