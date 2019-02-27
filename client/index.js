$(function () {
  let apiHost = 'jessieapi';
  let port = 9000;

  function listAllMessages() {
    $.get(`http://${apiHost}:${port}/messages`, function (messages) {
      $("#loading").remove();
      showMessages(messages);
      bindAllDeleteButton();
      bindAllEditText();
    });
  }

  function showMessages(messages) {
    $("#messagewindow").html("");
    messages.forEach(function (message) {
      var htmlcode = `<div class="record"><button id="MSG-${message.id}" name="record">${message.user}</button><span class="messagecontent" id="messagecontent-${message.id}">${message.msg}</span></div>`;
      $("#messagewindow").append(htmlcode);
      let messageBody = document.querySelector('#messagewindow');
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
    });
  }
  listAllMessages();

  function bindAllDeleteButton() {
    $("button[name='record']").click(function () {
      let elementId = $(this).attr('id');
      deleteMsg(elementId);
    });
  }

  function bindSingleDeleteButton(buttonId) {
    $(`#${buttonId}`).click(function () {
      let elementId = $(this).attr('id');
      deleteMsg(elementId);
    });
  }

  function bindAllEditText() {
    $("span").click(function () {
      let elementId = $(this).attr('id');
      editInputAera(elementId);
    });
  }

  function bindSingleEditText(TextId) {
    $(`#${TextId}`).click(function () {
      let elementId = $(this).attr('id');
      editInputAera(elementId);
    });
  }

  function deleteMsg(elementId) {
    let arr = elementId.split("-");
    let msgId = arr.length > 1 ? arr[1] : "";
    if (!!elementId) {
      $.ajax({
        url: `http://${apiHost}:${port}/message/${msgId}`,
        type: 'DELETE',
      }).done(function (result) {
        if (result.status.toUpperCase() === 'OK') {
          $("#" + elementId).parent().remove();
        }
      });
    }
    return false;
  }

  function editInputAera(elementId) {
    let arr = elementId.split("-");
    let msgId = arr.length > 1 ? arr[1] : "";
    if (!!msgId) {
      let userName = $("#MSG-" + msgId).html();
      $("#author").val(userName);
      let msgText = $(`#${elementId}`).html();
      $("#msg").val(msgText);
      $("span").removeClass("editing");
      $(`#${elementId}`).addClass("editing");
      $("#send").attr("name", msgId);
    }
    return;
  }

  $("#new").click(function () {
    $("span").removeClass("editing");
    // $("#author").val("");
    // $("#msg").val("");
    $("#send").attr("name", "");
    return false
  });

  $("#send").click(function () {
    let msgId = $("#send").attr("name");
    if (!!msgId && $(`#MSG-${msgId}`).length > 0) {
      $.ajax({
        url: `http://${apiHost}:${port}/message/${msgId}`,
        type: 'PUT',
        data: {
          message: {
            user: $("#author").val(),
            msg: $("#msg").val()
          }
        }
      }).done(function (result) {
        if (result.status.toUpperCase() === 'OK') {
          let buttonId = `MSG-${result.result.id}`;
          let TextId = `messagecontent-${result.result.id}`;
          $(`#${buttonId}`).html(result.result.user);
          $(`#${TextId}`).html(result.result.msg);
          $(`#messagecontent-${msgId}`).removeClass("editing");
          $("#author").val("");
          $("#msg").val("");
          $("#send").attr("name", "");
        }
      });
      return false;
    }
    else {
      $.ajax({
        url: `http://${apiHost}:${port}/messages`,
        method: 'POST',
        data: {
          message: {
            msg: $("#msg").val(),
            user: $("#author").val()
          }
        }
      }).done(function (result) {
        $("#msg").val("");
        if (result.status.toUpperCase() === 'OK') {
          let buttonId = `MSG-${result.result.id}`;
          let TextId = `messagecontent-${result.result.id}`;
          var htmlcode = `<div class="record"><button id="${buttonId}">${result.result.user}</button><span class="messagecontent" id="messagecontent-${result.result.id}">${result.result.msg}</span></div>`;
          $("#messagewindow").append(htmlcode);
          let messageBody = document.querySelector('#messagewindow');
          messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
          bindSingleDeleteButton(buttonId);
          bindSingleEditText(TextId);
        }
      });
      return false;
    }
  });
  var socket = io();
});