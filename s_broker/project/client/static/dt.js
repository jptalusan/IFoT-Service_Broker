$( document ).ready(() => {
  console.log('dt check2!');
});

// $(function () {
//   console.log('function');
//   $('#datepick').datetimepicker();
// });

$('.getfirstlast').on('click', function() {
  // var master_url = $('#master_url').val();
  var master_url = $("#master_url option:selected").val();
  var selector = $("#myselection option:selected").val();

  console.log('getfirstlast button clicked!' + master_url + ' ' + selector);

  var selector_url = 'http://' + master_url + ':5001/api/dt_get'
  console.log(selector_url);

  $.ajax({
    url: selector_url,
    data: JSON.stringify({
        "influx_ip":selector,
     }),
    method: 'POST',
    //dataType: "json",
    //contentType: "application/json; charset=utf-8",
    // accepts: "application/csv", #this is different than the one below
    // headers: { 'Accept': 'application/csv' }
  })
  .done((res) => {
    console.log('RES:', res);
    //$('<p>' + res + '</p>').appendTo('#Content');
    $("div.start_end_times").text(res);
    // console.log(res.unique_ID);
    // console.log(res.data.task_id);
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


$('.btn').on('click', function() {
  console.log('button clicked!');
  $.ajax({
    url: '/tasks',
    data: { type: $(this).data('type') },
    method: 'POST'
  })
  .done((res) => {
    console.log(res);
    console.log(res.unique_ID);
    console.log(res.data.task_id);
  })
  .fail((err) => {
    console.log(err);
  });
});
