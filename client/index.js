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
      var htmlcode = `<div><button id="MSG-${message.id}">${message.user}</button><span id="messagecontent-${message.id}">${message.msg}</span></div>`;
      $("#messagewindow").append(htmlcode);
    });
  }
  listAllMessages();

  function bindAllDeleteButton() {
    $("button").click(function () {
      let elementId = $(this).attr('id');
      if (elementId === "cancel") {
        return false;
      } else {
        deleteMsg(elementId);
      }
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
        console.log(result);
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
      $("#submit").val("update").attr("name", msgId);
      $("span").removeClass("editing");
      $(`#${elementId}`).addClass("editing");
      $("#cancel").show().attr("name", msgId);
    }
    return;
  }

  $("#chatform").submit(function (e) {
    e.preventDefault();
    if ($("#submit").val() === "send") {
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
        console.log(result);
        if (result.status.toUpperCase() === 'OK') {
          let buttonId = `MSG-${result.result.id}`;
          let TextId = `messagecontent-${result.result.id}`;
          var htmlcode = `<div><button id="${buttonId}">${result.result.user}</button><span id="messagecontent-${result.result.id}">${result.result.msg}</span></div>`;
          $("#messagewindow").append(htmlcode);
          bindSingleDeleteButton(buttonId);
          bindSingleEditText(TextId);
        }
      });
    }
    if ($("#submit").val() === "update") {
      let msgId = $("#submit").attr("name");
      console.log("user is: " + $("#author").val());
      console.log("msg is: " + $("#msg").val());
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
        console.log("result is: " + result);
        $("#cancel").hide();
        if (result.status.toUpperCase() === 'OK') {
          console.log("result is: " + result);
          console.log(`success to update this message: user = ${result.result.user},msg = ${result.result.msg}`);
          let buttonId = `MSG-${result.result.id}`;
          let TextId = `messagecontent-${result.result.id}`;
          $(`#${buttonId}`).val(result.result.user);
          $(`#${TextId}`).html(result.result.msg);
          $(`#messagecontent-${msgId}`).removeClass("editing");
          $("#author").val("");
          $("#msg").val("");
          $("#submit").val("send");
        }
      });
      return false;
    }
  });

  $("#cancel").click(function () {
    let msgId = $("#cancel").attr("name");
    $(`#messagecontent-${msgId}`).removeClass("editing");
    $("input#author").val("");
    $("input#msg").val("");
    console.log("sucess");
    $("#cancel").attr("style", "display:none");
    $("#submit").val("send");
    return false;
  })

});
