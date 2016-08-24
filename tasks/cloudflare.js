(function() {
  'use strict';
  
  module.exports = function(grunt) {
    grunt.registerMultiTask('cloudflare', 'Cloudflare tasks', function() {
      var done = this.async();
      
      var CloudFlare = require('cloudflare');
      var client = new CloudFlare({
        email: this.data.email,
        key: this.data.key
      });
      
      switch (this.data.action) {
        case 'add-record':
          var content = '';
          
          switch (typeof this.data.content) {
            case "function":
              content = this.data.content();
            break;
            default:
              content = this.data.content
            break;
          }
          
          client.browseZones()
            .then(function (zonesResult) {
              var zones = zonesResult.result;
              var zoneId = null;
              for (var i = 0, l = zones.length; i < l; i++) {
                if (zones[i].name === this.data.zone) {
                  zoneId = zones[i].id;
                  break;
                }
              }
              
              if (!zoneId) {
                grunt.log.error("Failed to find zone by name " + this.data.zone);
                done(false);
              } else {
                var recordData = {
                  type: this.data.type,
                  name: this.data.name,
                  content: content,
                  zone_id: zoneId
                };
                
                if (this.data.ttl) {
                  recordData.ttl = this.data.ttl;
                }
                
                var record = CloudFlare.DNSRecord.create(recordData);
                
                client.addDNS(record)
                  .then(function (data) {
                    done();
                  })
                  .catch(function (data) {
                    grunt.log.error("Failed to add record", data);
                    done(false);
                  });
              }
            }.bind(this))
            .catch(function (err) {
              grunt.log.error("Failed to find zone", err);
              done(false);
            });
        break;
      }
      
    });
  };
  
}).call(this);