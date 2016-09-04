$(function () {
  //Initializing
  $('.ui.basic.modal').modal();
  $('.ui.dropdown').dropdown();
  var $grid = $('#photos').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer'
  });

  //Events
  $( ".uploadButton" ).hover(
    function() {
      $( this ).removeClass( "basic" );
    }, function() {
      $( this ).addClass( "basic" );
    }
  );
  $(".uploadButton").on("click", function () {
      $('.ui.basic.modal').modal("show");
  });
  $("#upload").on("click", function () {
    if ($("#name").val() != "") {
      $('.ui.basic.modal').modal("hide");
      uploadFunction();
    } else {
      alert("Name is required");
    }
  });
  $(".more").on("click", function () {
    selectPlace();
  });
  $(".dimmerContent i").on("click", function () {
    if ($(this).hasClass("orange")) {
      like($(this).attr('id'), "unlike");
      $(this).removeClass("orange");
      var likes = parseInt($("#" + $(this).attr('id') + ".likes").html());
      likes--;
      $("#" + $(this).attr('id') + ".likes").html(likes);
    } else {
      like($(this).attr('id'), "like");
      $(this).addClass("orange");
      var likes = parseInt($("#" + $(this).attr('id') + ".likes").html());
      likes++;
      $("#" + $(this).attr('id') + ".likes").html(likes);
    }
    
  });



  //Functions
  hideMessage = function(){
    $('.message').transition('fade');
  }
  iconLike = function () {
    console.log($(this).html());
    if ($(this).hasClass("orange")) {
      like($(this).attr('id'), "unlike");
      $(this).removeClass("orange");
      var likes = parseInt($("#" + $(this).attr('id') + ".likes").html());
      likes--;
      $("#" + $(this).attr('id') + ".likes").html(likes);
    } else {
      like($(this).attr('id'), "like");
      $(this).addClass("orange");
      var likes = parseInt($("#" + $(this).attr('id') + ".likes").html());
      likes++;
      $("#" + $(this).attr('id') + ".likes").html(likes);
    }
  }
  
  function addPhoto(photo) {
    var card = '<div class="grid-item"><div class="myCard"><div class="image"><div class="dimmer"><div class="dimmerContent">'
    card += '<i id="'+ photo._id +'" onclick="iconLike()" class="heart link large icon"></i>';
    card += '<a href="/bucket/' + photo.link + '" class="ui basic inverted large orange button">Open Image</a>';
    card += '</div></div>';
    card += '<img src="../bucket/' + photo.link + '">';
    card += '</div><div class="content">';
    card += '<div class="name">' + photo.name + '</div>';
    card += '<span id="'+ photo._id +'" class="likes">' + photo.likes.length + '</span>';
    card += '<br><em><span style="color:white;margin-left:3px;">by</span> &nbsp; <a class="user" href="/user/'+ photo.user._id +'">'+ photo.user.name +'</a></em>';
    card += '<div class="ui divider"></div><div class="tag"><a href="" style="color:white !important;">';
    card += '<i class="inverted filter icon"></i>' + photo.category + '</a></div></div></div></div>';
    var $item = $(card);
    $grid.prepend($item)
      .masonry('prepended', $item);
    setTimeout(function () {
      clearInterval(interval);
    }, 10000);
    var interval = setInterval(function () {
      $grid.masonry('layout');
    } , 100);
                              
  }


  function ajax(config) {
  
    this.method = config.method || "POST";
    this.payload = config.payload || null;
    var xhr = new XMLHttpRequest();
    xhr.open(this.method, config.url, true);
    xhr.upload.addEventListener("progress", function (e) {
      config.progress(e);
    });
    xhr.addEventListener("load", function () {
      config.success(xhr);
    });

    xhr.addEventListener("err", config.error);
    xhr.send(this.payload);
  }

  function uploadFunction() {
    
    $(".progress").fadeIn(100);
    var uploadURL = "https://photosurf.herokuapp.com/upload";
    var uploadFile = $("#uploadFile");
    var name = $("#name");
    var category = $("#category");
    if (uploadFile.val() != "") {
      
      var form = new FormData();
      form.append("file", uploadFile[0].files[0]);
      form.append("name", name.val());
      form.append("category", category.val());
      ajax({
        method: "POST",
        url: uploadURL,
        success: function (xhr) {
          $(".progress").fadeOut(200);
          uploadFile.val("");
          var obj = JSON.parse(xhr.response);
          if (obj.name != "error") {
            if (window.location.pathname == "/") {
              addPhoto(obj);
            } else {
              successMessage();
            }
          } else {
            errorMessage();
          }
        },
        progress: function (e) {
          if (e.lengthComputable) {
            var perc = Math.round((e.loaded * 100) / e.total);
            $(".progress").width(perc + "%");
          }
        },
        payload: form
      });
    }
  }

  function errorMessage() {
    var message = '<div class="ui error message"><i onclick="hideMessage()" class="close icon"></i><div class="header">';
    message += 'There was some errors with your submission';
    message += '</div><ul class="list">';
    message += '<li>File must be and image</li>';
    message += '<li>Maximum file size is 2MB</li>';
    message += '</ul></div>';
  
    $(".messagePlace").append(message);  
  }

  function successMessage() {
    var message = '<div class="ui success message"><i onclick="hideMessage()" class="close icon"></i><div class="header">';
    message += 'Image Uploaded Successfuly';
    message += '</div></div>';
    
    $(".messagePlace").append(message);
  
  }
  function selectPlace() {
    var location = window.location.pathname.split('/')[1];
    if (location == "search") {
      getMore("searchajax", $("#searchbox").val() , $("#searchcategory").val() , $(".grid-item").length , null )
    } else if (location == "user") {
      if ($(".uploadsMenu").hasClass("active")) {
        getMore("userajax"  , null , null , $('.grid-item').length ,"uploads" )
      } else {
        getMore("userajax"  , null , null , $('.grid-item').length , "likes" )
      }
    }
  }

  function getMore(where  , name , category , skip , menu ) {
    var uploadURL = "https://photosurf.herokuapp.com/" + where;
    var user = window.location.pathname.split('/')[2] || null;
      
    var form = new FormData();
    form.append("menu", menu);
    form.append("user", user);
    form.append("name", name);
    form.append("skip", skip);
    form.append("category", category);
    ajax({
      method: "POST",
      url: uploadURL,
      success: function (xhr) {
        var $items = xhr.response;
        $grid.append($items).masonry('appended', $items);
        setTimeout(function () {
          clearInterval(interval);
        }, 20000);
        var interval = setInterval(function () {
          $grid.masonry('reloadItems');
          $grid.masonry('layout');
        } , 100);
      },
      progress: function (e) {
      },
      payload: form
    });
  }


  function like(id, like) {
    var form = new FormData();
    form.append("id", id);
    form.append("like", like);
    ajax({
      method: "POST",
      url: "https://photosurf.herokuapp.com/like",
      success: function (xhr) {
      },
      progress: function (e) {
      },
      payload: form
    });
  }  
  

});






