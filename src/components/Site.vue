<template>
  <div class="site">
    <div class="site-header has-text-centered">
      <h2 class="is-size-2">{{ site.name }} ({{ site.code | uppercase }})</h2>
      <p class="subtitle">
        <span class="heading">
          Elevation: {{ site.elevation }}m
          Location: {{ site.lat | ns}} {{ site.lng | ew }}
        </span>
        <span title="sunset">sunset: {{ sunset.format('HH:mm') }}</span>
        <small>UTC</small>
        &nbsp;&nbsp;
        <span title="sunrise">sunrise: {{ sunrise.format('HH:mm') }}</span>
        <small>UTC</small>
      </p>
    </div>

    <div>
      <h3 class="level-heading heading title is-size-4 is-bold">Current Values</h3>
      <nav class="level is-mobile">
        <div class="level-item has-text-centered" v-if="datums['Weather Air Temperature Value'].data">
          <div>
            <p class="heading">Air Temp &deg;C</p>
            <p class="title">{{ datums['Weather Air Temperature Value'].data | latestResult('Value') }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Weather Barometric Pressure Value'].data">
          <div>
            <p class="heading">Pressure mbar</p>
            <p class="title">{{ datums['Weather Barometric Pressure Value'].data | latestResult('Value') }}</p>
          </div>
        </div>
      <div class="level-item has-text-centered" v-if="datums['Weather Dew Point Value'].data">
        <div>
          <p class="heading">Dewpoint &deg;C</p>
          <p class="title">{{ datums['Weather Dew Point Value'].data | latestResult('Value') }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered" v-if="datums['Weather Humidity Value'].data">
          <div>
            <p class="heading">Humidity %</p>
            <p class="title">{{ datums['Weather Humidity Value'].data | latestResult('Value') }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Weather Wind Speed Value'].data">
          <div>
            <p class="heading">Wind meters/second</p>
            <p class="title">{{ datums['Weather Wind Speed Value'].data | latestResult('Value') }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Weather Wind Direction Value'].data">
          <div>
            <p class="heading">Wind &deg;E of N</p>
            <p class="title">{{ datums['Weather Wind Direction Value'].data | latestResult('Value') }}&deg;</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Weather Sky Brightness Value'].data">
          <div>
            <p class="heading">Brightness mag/arcsec<sup>^</sup>2</p>
            <p class="title">{{ datums['Weather Sky Brightness Value'].data | latestResult('Value') }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Boltwood Transparency Measure'].data">
          <div>
            <p class="heading">Sky Transparency %</p>
            <p class="title">{{ datums['Boltwood Transparency Measure'].data | latestResult('Value') }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered" v-if="datums['Boltwood Sky Minus Ambient Temperature'].data">
          <div>
            <p class="heading">Sky Temp &deg;C</p>
            <p class="title">{{ datums['Boltwood Sky Minus Ambient Temperature'].data | latestResult('Value') }}</p>
          </div>
        </div>
      </nav>
    </div>

    <section class="section section-medium">
      <p class="heading is-size-3 has-text-centered">Last {{ this.$store.state.range }}</p>
      <h4 class="is-size-4 helptoggle">  Open Status
        <a class="helptoggle is-pulled-right "><sup>?</sup>

        </a><span class="help is-pulled-right">All weather conditions are within acceptable range to allow observing.</span>
      </h4>

      <figure class="image">
        <Timeline datumid="oktoopen" :suntimes="suntTimes" :timezone="site.tz" datumname="Weather Ok To Open" :cdata="datums['Weather Ok To Open'].data"
                  :fdata="datums['Weather Failure Reason'].data"></Timeline>
      </figure>
    </section>

    <p class="has-text-centered">
      ❗ Data is interpolated between sensor readings and may not be accurate.
    </p>

    <section class="section section-xsmall " v-if="datums['Weather Air Temperature Value'].data">
      <h4 class="is-size-4">Air Temperature
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right"> Ambient temperature measured by HMP45C-L temperature probe at the site's weather station.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="airtemp" datumname="Air Temperature" unit="C"
                     :cdata="datums['Weather Air Temperature Value'].data"
                     :limit="limit('Weather Air Temperature Value')" limit_direction="min">
           </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Boltwood Sky Minus Ambient Temperature'].data">
      <h4 class="is-size-4">Sky Temp
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Sky Temperature is inferred from 8-14µm irradiance measure by a Boltwood II cloud sensor at the site's weather station.</span>

      </h4>

      <figure class="image">
        <TimeChart datumid="skytemp" datumname="Boltwood Sky Minus Ambient Temperature" unit="C"
                   :cdata="datums['Boltwood Sky Minus Ambient Temperature'].data">
        </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Boltwood Transparency Measure'].data">
      <h4 class="is-size-4">Sky Transparency (computed)
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Sky Transparency is a calculated value and is not measured directly.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="transparency" datumname="Boltwood Transparency Measure" unit="%"
                    :cdata="datums['Boltwood Transparency Measure'].data"
                    :limit="limit('Boltwood Transparency Measure')" limit_direction="min">
          </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Weather Humidity Value'].data">
      <h4 class="is-size-4">Humidity
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Relative humidity measured by HMP45C-L humidity probe at the site's weather station.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="humidity" datumname="Weather Humidity Value" unit="%"
                     :cdata="datums['Weather Humidity Value'].data"
                     :limit="limit('Weather Humidity Value')">
          </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Weather Barometric Pressure Value'].data">
      <h4 class="is-size-4">Pressure
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Barometric pressure measured by Vaisala PTB110 barometer at the site's weather station.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="pressure" datumname="Weather Barometric Pressure Value" unit="mbar"
                     :cdata="datums['Weather Barometric Pressure Value'].data"
                     :limit="limit('Weather Barometric Pressure Value')">
          </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall" v-if="datumDifference(datums['Weather Dew Point Value'].data, datums['Weather Air Temperature Value'].data)">
      <h4 class="is-size-4">Air temperature minus dewpoint
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Absolute value of difference between Dew Point and Air Temperature.</span>
      </h4>
      <figure class="image">
        <TimeChart datumid="ATminusDP" datumname="Air Temperature minus Dewpoint" unit="C"
                   :cdata="datumDifference(datums['Weather Dew Point Value'].data, datums['Weather Air Temperature Value'].data)"
                   :limit="2" limit_direction="min">
        </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Weather Wind Speed Value'].data">
      <h4 class="is-size-4">Wind Speed
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Wind speed measured by Windsonic1-L wind sensor at the site's weather station.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="windspeed" datumname="Weather Wind Speed Value" unit="m/s"
                     :cdata="datums['Weather Wind Speed Value'].data"
                     :limit="limit('Weather Wind Speed Value')">
          </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Weather Wind Direction Value'].data">
      <h4 class="is-size-4">Wind Direction
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Wind direction, in degrees East of North, measured by Windsonic1-L wind sensor at the site's weather station.</span>
      </h4>
      <figure class="image">
          <TimeChart datumid="winddirection" datumname="Weather Wind Direction Value" unit="deg"
                     :cdata="datums['Weather Wind Direction Value'].data"
                     :limit="limit('Weather Wind Direction Value')">
          </TimeChart>
      </figure>
    </section>

    <section class="section section-xsmall " v-if="datums['Weather Sky Brightness Value'].data">
      <h4 class="is-size-4">Sky Brightness
        <a class="helptoggle is-pulled-right"><sup><small>?</small></sup></a><span class="help is-pulled-right">Sky brightness, in magnitudes per square arcsecond, measured by Unihedron SQM-LE at the site's weather station.</span>

      </h4>
      <figure class="image">
          <TimeChart datumid="brightness" datumname="Weather Sky Brightness Value" unit="mag/arcsec^2"
                     :cdata="datums['Weather Sky Brightness Value'].data"
                     :max="23">
          </TimeChart>
      </figure>
    </section>


  </div>
</template>
<script>
import suncalc from 'suncalc';
import moment from 'moment';
import {sites} from '../config';
import TimeChart from './TimeChart';
import Timeline from './Timeline';

export default {
  name: 'Site',
  props: ['sitecode'],
  components: {TimeChart, Timeline},
  data(){
    return {
      site: {},
      datums: {
        'Weather Failure Reason': {
          data: [],
          limit: {
            default: null
          }
        },

        'Weather Air Temperature Value': {
          data: [],
          limit: {
            default: -20,
            coj: -4,
            ogg: 0
          }
        },
        'Weather Barometric Pressure Value': {
          data: [],
          limit:
            {

            }
        },
        'Weather Dew Point Value': {
          data: [],
          limit :
            {
              default: null
            }
        },
        'Weather Humidity Value': {
          data: [],
          limit: {
            default: 92.5,
            coj: 85,
            tfn: 75,
            ogg: 85
          }
        },
        'Weather Wind Speed Value': {
          data: [],
          limit: {
            default: 15,
            ogg: 17
          }
        },
        'Weather Wind Direction Value': {
          data: [],
          limit: {
            default: null
          }
        },
        'Weather Sky Brightness Value': {
          data: [],
          limit: {
            default: null
          }
        },
        'Boltwood Transparency Measure': {
          data: [],
          limit: {

          }
        },

        'Boltwood Sky Minus Ambient Temperature': {
          data: [],
          limit: {
            default: null
          }
        },

        'Weather Ok To Open': {
          data: [],
          limit: {
            default: null
          }
        },
        'Boltwood Transparency Close Threshold': {
          data: [],
          limit: {

          }
        }
      }
    };
  },
  watch: {
    '$route'(){
      this.initialize();
    },
    start(){
      this.fetchDatums();
    },
    end(){
      this.fetchDatums();
    }
  },
  methods:{
    initialize(){
      for (var i = 0; i < sites.length; i++) {
        if(sites[i].code === this.sitecode){
          this.site = sites[i];
          break;
        }
      }
      this.fetchDatums();
    },
    fetchDatums(){
      Object.keys(this.datums).forEach((key) => {
        this.fetchDatum(key, (resp) => {
          this.datums[key]['data'] = resp;
        });
      });
    },
    fetchDatum(datumName, cb){
      let request = new XMLHttpRequest();
      // if debugging, change this to localhost
      let url = 'https://weather-api.lco.global/query?site=' + this.site.code + '&datumname=' + datumName;
      // let url='http://localhost:3005/query?site=' + this.site.code + '&datumname=' + datumName;
      if(datumName === 'Weather Ok To Open' || datumName === 'Weather Failure Reason'){
        url += '&agg=False';
      }
      url += '&start=' + this.start.format() + '&end=' + this.end.format();
      request.open('GET', url, true);
      request.onload = () => {
        if (request.status >=200 && request.status < 400) {
          cb(JSON.parse(request.responseText));
        } else {
          console.log('error:' + request.responseText);
        }
      };

      request.onerror = function() {
        console.log('There was a connection error');
      };

      request.send();
    },
    limit(datumName){

      if (datumName == 'Boltwood Transparency Measure')
      { // this datum has a dynamically changing threshold
        let latest_value = this.$options.filters.latestResult(this.datums['Boltwood Transparency Close Threshold'].data, 'Value');
          return Number(latest_value);
      }

      if(this.datums[datumName].limit.hasOwnProperty(this.site.code)){
        return this.datums[datumName].limit[this.site.code];
      }else{
        return this.datums[datumName].limit.default;
      }
    },
    datumDifference(datum1, datum2)
    {
      /** Given two datum names, create a new datum object where each Value is their difference
       * Each packet looks like: {Timestamp, Value, ValueString}
       */

      let datum_difference = [];
      for (let packet_number = 0; packet_number < Math.min(datum1.length, datum2.length) ; packet_number++)
      {
        let packet = {};
          packet['TimeStamp'] = datum1[packet_number].TimeStamp;
          packet['TimeStampMeasured'] = datum1[packet_number].TimeStampMeasured;
          packet['Value'] = Math.abs(datum1[packet_number].Value - datum2[packet_number].Value);
          datum_difference.push(packet);

      }
      return datum_difference;
    }
  },
  created(){
    this.initialize();
  },
  computed:{
    suntTimes(){

      let suntimes_array = [];
      let chart_start = this.start;
      let chart_end = this.end;

      for (let days_difference = chart_end.diff(chart_start, 'days'); days_difference > -1; days_difference--)
      {
        let suntime_for_day = suncalc.getTimes(moment.utc().subtract(days_difference, 'days'), this.site.lat, this.site.lng);
        suntimes_array.push(suntime_for_day);
      }
      return suntimes_array;


    },
    sunrise(){
      // get last sunrise
      return moment.utc((this.suntTimes.slice(-1)[0].sunrise));
    },
    sunset(){
      // get last sunset
      return moment.utc((this.suntTimes.slice(-1)[0].sunset));
    },

    start(){
      // Make sure we get a little data leading up to the time range to avoid gaps
      let start = this.$store.getters.start.clone();
      start.subtract(moment.duration(3, 'hours'));
      return start;
    },
    end(){
      return this.$store.getters.end;
    },

  },

  filters: {
    latestResult(values, property)
    {
      /**
       * @param values - an array of values to parse, must contain a property name that matches the property parameter
       * @param property - the property you wish to extract, either 'Value' or 'ValueString'
       */

      if (property === 'Value')
      {
         if (!values || values.length < 1) return 0;
         let val = values[values.length - 1][property];
         return val.toFixed(1);
      }

      else if (property === 'ValueString')
      {
        if (!values || values.length < 1 ) return '';
        return values[values.length -1][property];
      }

    },

    cardinal(val){
      const num = Math.floor((val / 22.5) + 0.5);
      const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      return compass[num % 16];
    },
    ns(val){
      if(val > 0){
        return val + 'N'
      } else {
        return Math.abs(val) + 'S'
      }
    },
    ew(val){
      if(val > 0){
        return val + 'E'
      }
      else{
        return Math.abs(val) + 'W'
      }
    },
    uppercase(str){
      return str.toUpperCase();
    }
  }
};

</script>
<style lang="scss" scoped>
  .help {
    display: none;
    margin-right: 0px;
  }
  .helptoggle:hover + .help {
    display: inline;
  }
  .level-heading {
    padding: 0.5rem 1.5rem;
  }
  .subtitle {
    small {
      font-size: 0.8rem;
    }
  }
</style>
