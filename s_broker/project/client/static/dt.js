var isTaskWatchOngoing = false;

$( document ).ready(() => {
  console.log('dt check2!');

  $('form').submit(function(e) {
    //Important
    e.preventDefault();

    // Cancel all running timeouts to prevent mix ups

    var id = window.setTimeout(function() {}, 0);

    while (id--) {
      window.clearTimeout(id); // will do nothing if no timeout with id is present
    }

    if (window.isTaskWatchOngoing == true) {
      console.log("Still running in background.");
      return;
    }

    var url = 'http://163.221.68.242:5001/api/dt_get_readable';

    var form_data = $('form').serialize();
    var min_max_datetimes = $(".start_end_times").text();
    
    var formData = JSON.stringify(jQuery('form').serializeArray());
    console.log('formData: ', formData);

    var obj = JSON.parse(formData);

    var dictionary = {};

    obj.forEach(function(item){
      // console.log('name: ' + item.name);
      // console.log('value: ' + item.value);
      dictionary[item.name] = item.value;
    });
    
    var date_lim = min_max_datetimes.trim();
    var date_lim_arr = date_lim.split(";")
    var start_lim = date_lim_arr[0].split(" ")[0];
    var   end_lim = date_lim_arr[1].split(" ")[0];

    var start_date_lim = new Date(start_lim);
    var end_date_lim = new Date(end_lim);

    var start_date = new Date(dictionary["start_date"]);
    var end_date = new Date(dictionary["end_date"]);

    // console.log(start_date_lim);
    // console.log(start_date);

    // console.log(end_date_lim);
    // console.log(end_date);
    if ((start_date < start_date_lim) || (end_date > end_date_lim)) {
      console.log("ERROR!");
      $(".SVG_container").text("Date is either before available start date or after available end date");
    } else {
      console.log("OK!");
      //Check if limits are reached.



      getTaskStatus(dictionary);
    }

    // console.log("start_lim: " + start_lim);
    // console.log("end_lim: " + end_lim);

    // console.log('Dict:', dictionary);

    // console.log(formData);
    // console.log('form_data:' + form_data);
  });
});

function getTaskStatus(dictionary) {
  var url = "http://" + dictionary["cluster_address"] + ":5001/api/heatmap_trigger";

  var start = new Date(dictionary["start_date"] + " " + dictionary["start_time"]);
  var end = new Date(dictionary["end_date"] + " " + dictionary["end_time"]);

  var s_unix = Math.round(start.getTime()) * 1e6;
  var e_unix = Math.round(end.getTime()) * 1e6;

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify({
      "influx_ip": dictionary["influx_ip"],
      "start_time": s_unix,
      "end_time": e_unix,
      "feature": dictionary["feature"]
    }),
    success: function (data) {
      console.log(data.response_object);

      var task_id = data.response_object.data.task_id;
      query_task_id(task_id);
      console.log('success');
      $(".SVG_container").text("TEST");
    }
  });
}

function get_index_of_closest(arr, goal) {
  var closest = arr.reduce(function(prev, curr) {
    return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
  });

  return arr.indexOf(closest);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function generate_svg_image(json) {
  console.log(json);
  
  var parsed_data = JSON.parse(json);

  console.log(parsed_data.timestamps);
  console.log(parsed_data.data);

  var path_style = 'opacity: 0.5;font-size:12px;fill-rule:nonzero;stroke:#FFFFFF;st roke-opacity:1;stroke-width:0.1;stroke-miterlimit:4;stroke-dasharray:none;stroke-linecap:butt;marker-start:none;stroke-linejoin:bevel;fill:';

  var data_arr = [];
  var aa;
  for (aa = 0; aa < parsed_data.data.length; ++aa) {
    var bb;
    for (bb = 0; bb < parsed_data.data[aa].values.length; ++bb) {
      let data = parsed_data.data[aa].values[bb];
      data_arr.push(data);
    }
  }

  let data_min = Math.min.apply(null, data_arr);
  let data_max = Math.max.apply(null, data_arr);

  console.log(data_arr);
  console.log(data_min, data_max);
  let colors = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];
  let increment = (data_max - data_min) / colors.length;

  let some_arr = []
  for (var ss = 0; ss < colors.length; ++ss) {
    some_arr.push(data_min);
    data_min += increment;
  }

  console.log(some_arr);

  $.get('/uploads/updated-test.svg', function(svg){
    // console.log( svg );

    var parser = new DOMParser();
    var doc = parser.parseFromString(svg, "image/svg+xml");
    (function myLoop (i, json, doc) {


      setTimeout(function () {
        var curr_time = json.timestamps[i];
        let read_date = new Date(curr_time);
        if (isValidDate(read_date)) {
          let doc_text = doc.getElementsByTagName("text")[0];
          doc_text.setAttribute('style', 'font-size: 64px;');
          doc_text.innerHTML = read_date.toString();
        }
        var g_arr = doc.getElementsByTagName("g");
        // console.log(g_arr);
        var g_arr_index;
        for (g_arr_index = 0; g_arr_index < g_arr.length; ++g_arr_index) {
          var cont_arr = g_arr[g_arr_index].getElementsByClassName('container');
          //console.log('cont_arr.length:', cont_arr.length);
          if (cont_arr.length != 0) {
            var jj;
            for (jj = 0; jj < cont_arr.length; ++jj) {

              var cont_id = cont_arr[jj].getElementsByTagName("circle")[0].id;
              var data_j;
              for (data_j = 0; data_j < json.data.length; ++data_j) {
                var data_id = json.data[data_j].id;
                if (data_id == cont_id) {
                  var data_val = json.data[data_j].values[i];
                  if (data_val != null) {
                    cont_arr[jj].getElementsByTagName("text")[0].textContent = data_val.toFixed(2);
                    var circle = cont_arr[jj].getElementsByTagName("circle")[0];
                    circle.setAttribute('r', data_val.toFixed(2) * 1.5);
                    let color_index = get_index_of_closest(some_arr, data_val.toFixed(2));
                    circle.setAttribute('style', path_style + colors[color_index]);
                  }
                }
              }
            }
          }
        }

        var s = new XMLSerializer();
        var newXmlStr = s.serializeToString(doc);

        $(".SVG_container").html(newXmlStr);
        $('#title').string = "TEST";

        if (i <= parsed_data.timestamps.length) {
          myLoop(++i, json, doc);
        }
      }, 2000)
    })(0, parsed_data, doc);

  }, 'text');
}

function query_task_id(task_id) {
  var url = "http://163.221.68.242:5001/api/task/default/" + task_id;
  $.ajax({
    url: url,
    type: "POST",
    success: function(data){
      var task_status =  data.data.task_status;
      console.log(task_status);

      if (task_status == "failed") {
        window.isTaskWatchOngoing = false;
        console.log("Failed! stopping now.");
        $(".SVG_container").html("No data present...");
        return;
      } else if (task_status != "finished") {
        setTimeout(function() {
          window.isTaskWatchOngoing = true;
          query_task_id(task_id);
          // $('#tasks').html(html);
          console.log('Checking again in 1 sec!');
        }, 1000);
      } else {
        window.isTaskWatchOngoing = false;
        console.log('done');

        // Parsing JSON
        console.log(data);
        // var parsed_data = JSON.parse(data);
        var json_svg_data = data.data.task_result.svg_data;
        generate_svg_image(json_svg_data);
        // console.log(data.data.task_result.svg_data.data[0].id);
        // $(".SVG_container").html(data);



        // Changing data!
        //Parse json and change values every time function is called. do it in a loop

        // var svg = data.data.task_result.svg_data;
        // var parser = new DOMParser();
        // var doc = parser.parseFromString(svg, "image/svg+xml");
        // doc.getElementsByTagName("text")[0].innerHTML = 'TAE';

        // // console.log(doc.getElementsByTagName("g"));
        // var g_arr = doc.getElementsByTagName("g");
        // var i;
        // for (i = 0; i < g_arr.length; ++i) {
        //   var cont_arr = g_arr[i].getElementsByClassName('container');
        //   if (cont_arr.length != 0) {
        //     var j;
        //     for (j = 0; j < cont_arr.length; ++j) {
        //       cont_arr[j].getElementsByTagName("text")[0].textContent = "HEY";
        //       var cont_id = cont_arr[j].getElementsByTagName("circle")[0].id;
        //       // console.log(cont_arr[j].getElementsByTagName("text")[0]);
        //       console.log(cont_id);
        //       cont_arr[j].getElementsByTagName("circle")[0].setAttribute('r', 200.0);
        //       var r = cont_arr[j].getElementsByTagName("circle")[0].getAttribute('r');

        //       // console.log(r);
        //       // console.log(cont_arr[j].getElementsByTagName("circle")[0]);
        //     }
        //   }
        // }
        // var s = new XMLSerializer();
        // var newXmlStr = s.serializeToString(doc);

        // $(".SVG_container").html(newXmlStr);
        // $('#title').string = "TEST";
      }
    }
  });
}

$("#influx_select").change(function() {
  console.log("Changed influx DB");
  let influx_db = $("#influx_select").find(":selected").val();

  var master_url = $("#master_url option:selected").val();
  var selector_url = 'http://' + master_url + ':5001/api/dt_get_readable'

  $.ajax({
    url: selector_url,
    data: JSON.stringify({
        "influx_ip":influx_db,
     }),
    method: 'POST',
  })
  .done((res) => {
    console.log('RES:', res);
    $("div.start_end_times").text(res);
  })
  .fail((err) => {
    console.log('ERROR');
    console.log(err.responseText);
  });
});

// https://www.journaldev.com/4656/jquery-get-attribute-set-remove
$('.btn').on('click', function() {
  // $("#feature_select").empty();
  console.log("start_end_times:", $(".start_end_times").text());
  console.log("start_data text:", $("#start_date").text());
  console.log("start_data val:", $("#start_date").val());
  console.log("start_data va, set:", $("#start_date").val('2018-11-11'));
  console.log("start_data va, set:", $("#start_date").val('2020-11-11'));
  console.log("start_time va, set:", $("#start_time").val('09:01'));
  console.log("end_time va, set:", $("#end_time").val('10:10'));

  // console.log($("#start_data").defaultValue());
  $("#start_data").attr("defaultValue", "2222-11-11");
  $("#start_data").attr("min", "2001-10-10");
  // $("#email").attr("value", "New value");
  // $("#start_data").min('2010-10-11');

  $('#start_data').prop('defaultValue', '2020-11-11');
  $('#start_data').val('Hello').prop('defaultValue', function(){
      return this.value
  });
  var defaultValue = $("#start_data").attr("defaultValue");
  console.log('defaultValue: ', defaultValue);
  $('#start_data').prop('min', '2000-11-11');
  console.log('min: ', $("#start_data").attr("min"));
  // console.log($("#start_data").max());
});
// $(function () {
//   console.log('function');
//   $('#datepick').datetimepicker();
// });
var successFunction = function(response) {
  location.reload();
}

$('.getfirstlast').on('click', function() {
  // var master_url = $('#master_url').val();
  var master_url = $("#master_url option:selected").val();
  var selector = $("#myselection option:selected").val();

  console.log('getfirstlast button clicked!' + master_url + ' ' + selector);

  var selector_url = 'http://' + master_url + ':5001/api/dt_get_readable'
  console.log(selector_url);

  $.ajax({
    url: selector_url,
    data: JSON.stringify({
        "influx_ip":selector,
     }),
    method: 'POST',
  })
  .done((res) => {
    console.log('RES:', res);
    $("div.start_end_times").text(res);
  })
  .fail((err) => {
    console.log('ERROR');
    console.log(err.responseText);
  });
});


$('.getdatetime').on('click', function() {
  var master_url = $('#master_url').val();

  var selector = $("#myselection option:selected").val();

  console.log('getdatetime button clicked!' + master_url + ' ' + selector);
//curl  -H "Accept: application/csv" -i -G 'http://nuc1:8086/query?db=bl01_db&pretty=true&epoch=u' --data-urlencode 'q=SELECT * from "autogen"."meas_1" WHERE time > 1537321604504583638 and time < 1537322510246705575'

  var selector_url = 'http://163.221.68.206:8086/query?'
  console.log(selector_url);

  $.ajax({
    url: selector_url,
    data: { "q": 'SELECT * from "autogen"."meas_1" WHERE time > 1537321604504583638 and time < ' + master_url + ' and "bt_address" = \'FA114A6A871C\'',
            "db": "bl01_db",
            "pretty": true,
            "epoch": "ms"},
    method: 'GET',
    // accepts: "application/csv", #this is different than the one below
    headers: { 'Accept': 'application/csv' }
  })
  .done((res) => {
    console.log(res);
    $('<p>' + res + '</p>').appendTo('#Content');
    // console.log(res.unique_ID);
    // console.log(res.data.task_id);
  })
  .fail((err) => {
    console.log(err.responseText);
  });
});
