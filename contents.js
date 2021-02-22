console.log("DeepLopener PRO loaded");
var api_key;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "got_apikey") {
    api_key = request.api_key;
    sendResponse();
  }
});

let hoverflag = true;
chrome.storage.sync.get(null, function (items) {
  hoverflag = items.hoverflag;
  if (typeof hoverflag === "undefined" || hoverflag == "Enable") {
    hoverflag = true;
  } else {
    hoverflag = false;
  }
});

function txt_replace(txt, transtxt, classid, selid) {
  console.log("Text-oriented replacement mode");
  booltrans[classid] = true;
  $(function () {
    $(".translated" + "#" + classid)
      .off()
      .on("contextmenu", function () {
        window.getSelection().removeAllRanges();
        clickid = $(this).attr("id");
        if (booltrans[clickid] == true) {
          $(this).text(txt);
          $(".hovertxt").text(transtxt);
          booltrans[clickid] = false;
        } else {
          $(this).text(transtxt);
          $(".hovertxt").text(txt);
          booltrans[clickid] = true;
        }
        if (hoverflag) {
          var left = $(this).offset().left - $(window).scrollLeft();
          var top =
            $(this).offset().top -
            $(window).scrollTop() +
            $(this).outerHeight();
          var width = $(this).outerWidth();
          offsetCenterLeft = left + width / 2;
          $(".resultarea").css({
            top: top,
            left: offsetCenterLeft - $(".resultarea").outerWidth() / 2,
          });
        }
        del_iconNode();
        return false;
      });
    if (hoverflag) {
      $(".translated" + "#" + classid).hover(
        function () {
          thisel = this;
          $(window).scroll(function () {
            if (thisel !== undefined) {
              $(thisel).css("outline", "");
              resultareaupdate(thisel);
            }
          });
          function resultareaupdate(thisel) {
            $(thisel).css("outline", "2px solid black");
            var resultarea = document.createElement("div");
            resultarea.className = "resultarea";
            resultarea.innerHTML = "<div class=hovertxt></div>";
            $(".resultarea").remove();
            document.body.append(resultarea);
            var left = $(thisel).offset().left - $(window).scrollLeft();
            var top =
              $(thisel).offset().top -
              $(window).scrollTop() +
              $(thisel).outerHeight();
            var width = $(thisel).outerWidth();
            offsetCenterLeft = left + width / 2;
            $(".resultarea").css({
              display: "block",
              width: width * 0.75,
            });
            clickid = $(thisel).attr("id");
            if (booltrans[clickid] == true) {
              $(".hovertxt").append($("<span>" + txt + "</span>"));
            } else {
              $(".hovertxt").append($("<span>" + transtxt + "</span>"));
            }
            $(".resultarea").css({
              top: top,
              left: offsetCenterLeft - $(".resultarea").outerWidth() / 2,
            });
          }
          resultareaupdate(this);
        },
        function () {
          $(this).css("outline", "");
          thisel = undefined;
          $(".resultarea").remove();
        }
      );
    }
  });
  var text_oriented = document.getElementById("text_oriented" + selid);
  if (
    $("#text_oriented" + selid)
      .children()
      .hasClass("translating")
  ) {
    text_oriented.innerHTML = "";
  }
  var newNode = document.createElement("span");
  newNode.className = "translated";
  newNode.setAttribute("id", classid);
  newNode.innerHTML = transtxt + "<br>";
  text_oriented.appendChild(newNode);
  window.getSelection().removeAllRanges();
}

var selection;
var selectionid = 0;
var txtlist = [];
var tmptxtlist = [];
var tmptranslatedtxtlist = [];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "selection") {
    del_iconNode();
    if (window.getSelection) {
      selection = window.getSelection().toString().split(/\n/g);
      for (var i = 0; i < selection.length; i++) {
        selection[i].replace(/[;；:：]/g, "\n");
        if (
          selection[i].replace(/[ 　]/g, "").replace(/%C2%A0/g, "").length == 0
        ) {
          selection.splice(i, 1);
          i -= 1;
        }
      }
    } else {
      selection = "";
    }
    chrome.runtime.sendMessage(
      { message: "popup", popup: request.popup, selectionid: selectionid },
      function (res) {}
    );
    sendResponse(selection);
    if (!request.popup && selection.length < 20) {
      txtlist[selectionid] = selection;
      tmptxtlist[selectionid] = [];
      tmptranslatedtxtlist[selectionid] = [];
      var trelm = document.createElement("span");
      trelm.className = "text_oriented";
      trelm.setAttribute("id", "text_oriented" + selectionid);
      trelm.innerHTML =
        "<span class='translating'>" +
        window.getSelection().toString().replace(/\n/g, "<br>") +
        "</span>";
      window.getSelection().getRangeAt(0).deleteContents();
      window.getSelection().getRangeAt(0).insertNode(trelm);
    }
    window.getSelection().removeAllRanges();
    selectionid++;
  }
});

var txtlist = [];
var translatedtxtlist = [];
var booltrans = [];
var classid = 0;
var num_trans = 0;
var pdftransid = 0;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "translated") {
    console.log(
      request.selectionid +
        " Original:\n" +
        request.txt +
        "\n\nTranslation result by DeepL Pro (deepl.com) API :\n" +
        request.trtxt
    );
    if (!request.is_pdf) {
      var selid = request.selectionid;
      if (request.popup) {
        lay_replace(request.txt, request.trtxt);
      } else {
        tmptxtlist[selid].push(request.txt);
        tmptranslatedtxtlist[selid].push(request.trtxt);
        if (tmptranslatedtxtlist[selid].length == txtlist[selid].length) {
          for (let i = 0; i < txtlist[selid].length; i++) {
            var j = tmptxtlist[selid].indexOf(txtlist[selid][i]);
            txt_replace(
              txtlist[selid][i],
              tmptranslatedtxtlist[selid][j],
              num_trans,
              selid
            );
            num_trans++;
          }
        }
      }
    } else {
      //is_pdf mode
      $(
        "<span class='pdftranslated' id='pdftransid" +
          pdftransid +
          "''>" +
          request.trtxt
            .replace(/\. ([A-Z])/g, "．<br>$1")
            .replace(/[。]/g, "．<br>") +
          "</span>"
      ).appendTo("html");
      $("#pdftransid" + pdftransid).draggable({ scroll: false });
      $(".pdftranslated").css("max-height", $(window).height() * 0.9 + "px");
      $(".pdftranslated").resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
      });
      $("html").on("contextmenu", function (e) {
        for (let i = 0; i <= pdftransid; i++) {
          if ($(e.target).closest("#pdftransid" + i).length == 1) {
            $($("#pdftransid" + i).remove());
            break;
          }
        }
        return false;
      });
      pdftransid++;
    }
  }
});

var seltxt = "";
function del_iconNode() {
  $(".par_deeplopener_icon").remove();
}
function send_icon() {
  chrome.runtime.sendMessage(
    { message: "icon", selectionid: selectionid },
    function (res) {
      del_iconNode();
    }
  );
}
function pdf_createtabs() {
  chrome.runtime.sendMessage({ message: "pdf_createtabs" }, function (res) {
    del_iconNode();
  });
}
var url = document.URL;
var iconflag = true;
chrome.storage.sync.get(null, function (items) {
  iconflag = items.iconflag;
  if (typeof iconflag === "undefined" || iconflag == "Enable") {
    iconflag = true;
  } else {
    iconflag = false;
  }
  if (document.contentType != "application/pdf" && iconflag) {
    $(function () {
      $("body").on("click", function (e) {
        function ins_iconNode() {
          var newNode = document.createElement("p");
          newNode.className = "par_deeplopener_icon";
          newNode.innerHTML =
            "<div class='deeplopener_icon' style='z-index:9999;cursor:pointer;position:absolute;left:" +
            (e.pageX + 5) +
            "px;top:" +
            e.pageY +
            "px;'><img src='" +
            chrome.runtime.getURL("icon24.png") +
            "'></div>";
          newNode.addEventListener("click", send_icon, false);
          document.body.appendChild(newNode);
        }
        del_iconNode();
        if (
          window.getSelection().toString().length > 0 &&
          window.getSelection().toString() != "\n" &&
          seltxt != window.getSelection().toString()
        ) {
          seltxt = window.getSelection().toString();
          ins_iconNode();
        } else {
          seltxt = "";
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "command") {
    sendResponse(selectionid);
  }
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "ispdf") {
    let res;
    if (document.contentType === "application/pdf") {
      res = true;
    } else {
      res = false;
    }
    sendResponse(res);
  }
  return true;
});
var elm;
if (document.contentType != "application/pdf") {
  var timer = Date.now();
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "x") {
      if (Date.now() - timer < 1000) {
        send_icon(); //iconではないがやることは同じ
      }
      timer = Date.now();
    }
  });
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.message == "selectionmode") {
      sendResponse();
      $(document).on("mousemove", (e) => {
        let x = e.clientX;
        let y = e.clientY;
        if (elm != document.elementFromPoint(x, y)) {
          try {
            elm.style.border = "";
          } catch {}
        }
        try {
          elm = document.elementFromPoint(x, y);
          elm.style.border = "solid 1px black";
        } catch {}
      });
      $(document).on("click", (e) => {
        let x = e.clientX;
        let y = e.clientY;
        elm = document.elementFromPoint(x, y);
        elm.style.border = "";
        $(document).off("mousemove");
        $(document).off("contextmenu");
      });
      $(document).on("contextmenu", (e) => {
        let x = e.clientX;
        let y = e.clientY;
        elm = document.elementFromPoint(x, y);
        elm.style.border = "";
        var rng = document.createRange();
        rng.selectNode(elm);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(rng);
        len = elm.innerText.length;
        if (len > 4000) {
          var conf = confirm(
            "Are you sure you want to translate this?\n\nIt costs about " +
              len +
              " characters"
          );
          if (conf == true) {
            api_xml_translation(elm);
          }
        } else {
          api_xml_translation(elm);
        }

        $(document).off("mousemove");
        $(document).off("contextmenu");
        return false;
      });
    }
  });
}

function api_xml_translation(elm) {
  var target_html = elm.innerHTML;
  chrome.storage.sync.get(null, function (items) {
    var target = items.target;
    if (typeof target === "undefined") {
      target = "EN-US";
    }
    var api_url = "https://api.deepl.com/v2/translate";
    var params = {
      auth_key: api_key,
      text: target_html,
      target_lang: target,
      tag_handling: "xml",
    };
    var data = new URLSearchParams();
    Object.keys(params).forEach((key) => data.append(key, params[key]));

    fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; utf-8",
      },
      body: data,
    }).then((res) => {
      if (res.status == "200") {
        res.json().then((resData) => {
          elm.innerHTML = resData.translations[0].text;
        });
      } else {
        elm.innerHTML =
          "This is a sample of the translation result from DeepLopener PRO.";
        switch (res.status) {
          case 400:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nBad request. Please check error message and your parameters."
            );
            break;
          case 403:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nAuthorization failed. Please supply a valid auth_key parameter."
            );
            break;
          case 404:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nThe requested resource could not be found."
            );
            break;
          case 413:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nThe request size exceeds the limit."
            );
            break;
          case 429:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nToo many requests. Please wait and resend your request."
            );
            break;
          case 456:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nQuota exceeded. The character limit has been reached."
            );
            break;
          case 503:
            alert(
              "DeepLopener PRO Error : " +
                res.status +
                "\nResource currently unavailable. Try again later."
            );
            break;
          default:
            alert("DeepLopener PRO Error : " + res.status);
        }
      }
      window.getSelection().removeAllRanges();
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "get_body_length") {
    sendResponse(document.body.innerText.length);
  }
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "page_translate") {
    $(document).off("mousemove");
    $(document).off("contextmenu");
    api_xml_translation(document.body);
  }
});
