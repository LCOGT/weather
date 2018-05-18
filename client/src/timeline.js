/**
Taken from https://github.com/fanthos/chartjs-chart-timeline
**/
import moment from 'moment';

const helpers = Chart.helpers;
const isArray = helpers.isArray;

var TimelineConfig = {
    myTime : {
        redoLabels: false
    },
    position: 'bottom',

    time: {
        parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
        format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
        unit: false, // false == automatic or override with week, month, year, etc.
        round: false, // none, or override with week, month, year, etc.
        displayFormat: false, // DEPRECATED
        isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
        minUnit: 'millisecond',
        distribution: 'linear',
        bounds: 'data',

        // defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
        displayFormats: {
            millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
            second: 'h:mm:ss a', // 11:20:01 AM
            minute: 'h:mm a', // 11:20 AM
            hour: 'hA', // 5PM
            day: 'MMM D', // Sep 4
            week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
            month: 'MMM YYYY', // Sept 2015
            quarter: '[Q]Q - YYYY', // Q3
            year: 'YYYY' // 2015
        },
    },
    ticks: {
        autoSkip: false
    }
};


/**
 * Convert the given value to a moment object using the given time options.
 * @see http://momentjs.com/docs/#/parsing/
 */
function momentify(value, options) {
    var parser = options.parser;
    var format = options.parser || options.format;

    if (typeof parser === 'function') {
        return parser(value);
    }

    if (typeof value === 'string' && typeof format === 'string') {
        return moment(value, format);
    }

    if (!(value instanceof moment)) {
        value = moment(value);
    }

    if (value.isValid()) {
        return value;
    }

    // Labels are in an incompatible moment format and no `parser` has been provided.
    // The user might still use the deprecated `format` option to convert his inputs.
    if (typeof format === 'function') {
        return format(value);
    }

    return value;
}

function parse(input, scale) {
    if (helpers.isNullOrUndef(input)) {
        return null;
    }

    var options = scale.options.time;
    var value = momentify(scale.getRightValue(input), options);
    if (!value.isValid()) {
        return null;
    }

    if (options.round) {
        value.startOf(options.round);
    }

    return value.valueOf();
}

function arrayUnique(items) { // TODO: Remove this function since it's not used?
    var hash = {};
    var out = [];
    var i, ilen, item;

    for (i = 0, ilen = items.length; i < ilen; ++i) {
        item = items[i];
        if (!hash[item]) {
            hash[item] = true;
            out.push(item);
        }
    }

    return out;
}

function sorter(a, b) {
    return a - b;
}

var MIN_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

var TimelineScale = Chart.scaleService.getScaleConstructor('time').extend({

    determineDataLimits: function() {
        var me = this;
        var chart = me.chart;
        var timeOpts = me.options.time;
        var min = MAX_INTEGER;
        var max = MIN_INTEGER;
        var timestamps = [];
        var timestampobj = {};
        var datasets = [];
        var i, j, ilen, jlen, data, timestamp0, timestamp1;


        // Convert data to timestamps
        for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
            if (chart.isDatasetVisible(i)) {
                data = chart.data.datasets[i].data;
                datasets[i] = [];


                for (j = 0, jlen = data.length; j < jlen; ++j) {

                  console.log('data[j][0]');
                  console.log(data[j][0]);

                    timestamp0 = parse((data[j][0]).time, me);
                    timestamp1 = parse((data[j][1]).time, me);

                    console.log("timestamp0");
                    console.log(timestamp0);

                    console.log("timestamp1");
                    console.log(timestamp1);

                    if (timestamp0 > timestamp1) {
                        [timestamp0, timestamp1] = [timestamp1, timestamp0];
                    }
                    if (min > timestamp0 && timestamp0) {
                        min = timestamp0;
                    }
                    if (max < timestamp1 && timestamp1) {
                        max = timestamp1;
                    }

                    // this data[j][2] object is always undefined
                    datasets[i][j] = [timestamp0, timestamp1, data[j][2]];
                    if (timestampobj.hasOwnProperty(timestamp0)) {
                        timestampobj[timestamp0] = true;
                        timestamps.push(timestamp0);
                    }
                    if (timestampobj.hasOwnProperty(timestamp1)) {
                        timestampobj[timestamp1] = true;
                        timestamps.push(timestamp1);
                    }
                }
            } else {
                datasets[i] = [];
            }
        }

        if (timestamps.size) {
            timestamps.sort(sorter);
        }

        console.log("timeopts");
        console.log(timeOpts);
        min = parse(timeOpts.min, me) || min;
        max = parse(timeOpts.max, me) || max;

        // In case there is no valid min/max, let's use today limits
        min = min === MAX_INTEGER ? +moment().startOf('day') : min;
        max = max === MIN_INTEGER ? +moment().endOf('day') + 1 : max;

        // Make sure that max is strictly higher than min (required by the lookup table)
        me.min = Math.min(min, max);
        me.max = Math.max(min + 1, max);

        // PRIVATE
        me._horizontal = me.isHorizontal();
        me._table = [];
        me._timestamps = {
            data: timestamps,
            datasets: datasets,
            labels: []
        };
    },
});

Chart.scaleService.registerScaleType('timeline', TimelineScale, TimelineConfig);

Chart.controllers.timeline = Chart.controllers.bar.extend({

    getBarBounds : function (bar) {
        var vm =   bar._view;
        var x1, x2, y1, y2;

        x1 = vm.x;
        x2 = vm.x + vm.width;
        y1 = vm.y;
        y2 = vm.y + vm.height;
        return {
            left : x1,
            top: y1,
            right: x2,
            bottom: y2
        };

    },

    update: function(reset) {
        var me = this;
        var meta = me.getMeta();
        helpers.each(meta.data, function(rectangle, index) {
            me.updateElement(rectangle, index, reset);
        }, me);
    },

    updateElement: function(rectangle, index, reset) {
        var me = this;
        var meta = me.getMeta();
        var xScale = me.getScaleForId(meta.xAxisID);
        var yScale = me.getScaleForId(meta.yAxisID);
        var dataset = me.getDataset();

        var data = dataset.data[index];
        console.log("data in updateElement"); // this prints  Array of objects: {time: , reason: }
        console.log(data);


        var custom = rectangle.custom || {};
        var datasetIndex = me.index;
        var rectangleElementOptions = me.chart.options.elements.rectangle;

        rectangle._xScale = xScale;
        rectangle._yScale = yScale;
        rectangle._datasetIndex = me.index;

        rectangle._index = index;

        console.log("index in updateElement() is: " + index);
        var ruler = me.getRuler(index);

        //var x = xScale.getPixelForValue(data[0]);
        //var end = xScale.getPixelForValue(data[1]);
      var x = xScale.getPixelForValue(data[0].time);
      var end = xScale.getPixelForValue(data[1].time);

        var y = yScale.getPixelForValue(data, datasetIndex, datasetIndex);
        var width = end - x;
        var height = me.calculateBarHeight(ruler);
        var color = me.chart.options.colorFunction(data[2]);

        // This one has in account the size of the tick and the height of the bar, so we just
        // divide both of them by two and subtract the height part and add the tick part
        // to the real position of the element y. The purpose here is to place the bar
        // in the middle of the tick.
        var boxY = y - (height / 2);

        rectangle._model = {
            x: reset ?  x - width : x,   // Top left of rectangle
            y: boxY , // Top left of rectangle
            width: width,
            height: height,
            base: x + width,
          backgroundColor: me.chart.data.datasets[rectangle._datasetIndex].backgroundColor,
            borderSkipped: custom.borderSkipped ? custom.borderSkipped : rectangleElementOptions.borderSkipped,
            borderColor: custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, rectangleElementOptions.borderColor),
            borderWidth: custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangleElementOptions.borderWidth),
            // Tooltip
            label: me.chart.data.labels[index],
            datasetLabel: dataset.label
        };

        rectangle.draw = function() {
            var ctx = this._chart.ctx;
            var vm = this._view;
            ctx.fillStyle = vm.backgroundColor;
            ctx.lineWidth = vm.borderWidth;
            helpers.drawRoundedRectangle(ctx, vm.x, vm.y, vm.width, vm.height, 1);
            ctx.fill();
        };

        rectangle.inXRange = function (mouseX) {
            var bounds = me.getBarBounds(this);
            return mouseX >= bounds.left && mouseX <= bounds.right;
        };
        rectangle.tooltipPosition = function () {
            var vm = this.getCenterPoint();
            return {
                x: vm.x ,
                y: vm.y
            };
        };

        rectangle.getCenterPoint = function () {
            var vm = this._view;
            var x, y;
            x = vm.x + (vm.width / 2);
            y = vm.y + (vm.height / 2);

            return {
                x : x,
                y : y
            };
        };

        rectangle.inRange = function (mouseX, mouseY) {
            var inRange = false;

            if(this._view)
            {
                var bounds = me.getBarBounds(this);
                inRange = mouseX >= bounds.left && mouseX <= bounds.right &&
                    mouseY >= bounds.top && mouseY <= bounds.bottom;
            }
            return inRange;
        };

        rectangle.pivot();
    },

    getBarCount: function() {
        var me = this;
        var barCount = 0;
        helpers.each(me.chart.data.datasets, function(dataset, datasetIndex) {
            var meta = me.chart.getDatasetMeta(datasetIndex);
            if (meta.bar && me.chart.isDatasetVisible(datasetIndex)) {
                ++barCount;
            }
        }, me);
        return barCount;
    },


    // draw
    draw: function (ease) {
        var easingDecimal = ease || 1;
        var i, len;
        var metaData = this.getMeta().data;
        for (i = 0, len = metaData.length; i < len; i++)
        {
            metaData[i].transition(easingDecimal).draw();
        }
    },

    // From controller.bar
    calculateBarHeight: function(ruler) {
        var me = this;
        var yScale = me.getScaleForId(me.getMeta().yAxisID);
        if (yScale.options.barThickness) {
            return yScale.options.barThickness;
        }
        return yScale.options.stacked ? ruler.categoryHeight : ruler.barHeight;
    },

    removeHoverStyle: function(e) {
        // TODO
    },

    setHoverStyle: function(e) {
        // TODO: Implement this
    }

});



Chart.defaults.timeline = {

    colorFunction: function() {
        return 'black';
    },

    layout: {
        padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    },

    legend: {
        display: true
    },

    scales: {
        xAxes: [{
            type: 'timeline',
            position: 'bottom',
            distribution: 'linear',
            categoryPercentage: 1.0,
            barPercentage: 1.0,

            gridLines: {
                display: true,
                // offsetGridLines: true,
                drawBorder: true,
                drawTicks: true
            },
            ticks: {
                maxRotation: 0
            },
            unit: 'day'
        }],
        yAxes: [{
            type: 'category',
            id: 'y-axis-0',
            position: 'left',
            barThickness : 20,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
            offset: true,
          autoskip: false,
          //offset: false,
            gridLines: {
                //display: true,
                //offsetGridLines: true,
                drawBorder: true,
                drawTicks: true
            },
        }]
    },
    tooltips: {
      enabled: true,
        callbacks: {
            title: function(tooltipItems, data) {

              console.log("tooltip items");
              console.log(tooltipItems);

              console.log("data");
              console.log(data);

                var d = data.labels[tooltipItems[0].datasetIndex];
                return d;
            },
            label: function(tooltipItem, data) {
                console.log("tooltip item");
                console.log(tooltipItem);

                console.log("data");
                console.log(data);
                var d = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                // the first element in the array below is always undefined
                //return [d[2], moment(d[0]).format('L LTS'), moment(d[1]).format('L LTS')];
              console.log("d");
              console.log(d);

              //return [moment(d[0]).format('L LTS'), moment(d[1]).format('L LTS')];
              return [d[0].time.format('L LTS') + ': ' + d[0].reason]
            }
        }
    }
};
