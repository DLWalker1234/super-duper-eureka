$(document).ready(function() {
  $('.favorite').on('click', function(e) {
    const derpID = $(e.currentTarget).data('derpid');
    const url = 'derps/' + derpID + '/favorites';
    $.ajax({
      type: 'POST',
      url: url,
      success: function(data) {
        console.log('send a favorite');
      },
      error: function(data) {
        console.log('not sent');
      }
    });
  });

  $('.profile__follow-button').on('click', function(e) {
    const userID = $(e.currentTarget).data('userid');
    const url = '/users/' + userID + '/follow';
    if ($(this).hasClass('following')) {
      $(this).text('Follow');
      $(this).removeClass('following');
    } else {
      $(this).text('Unfollow');
      $(this).addClass('following');
    }
    $.ajax({
      type: 'POST',
      url: url,
      success: function(data) {
        console.log('Followed the user');
      },
      error: function(data) {
        console.log('not sent');
      }
    });
  });

  $('.derp__edit').on('click', function(e) {
    e.preventDefault();
    let $editButton = $(e.target);
    if ($editButton.hasClass("derp__edit")) {
      // Change "edit" to "save" on the button
      $editButton.text("Save").removeClass("derp__edit").addClass("derp__save");
      // Get the derp content text
      let $originalDerp = $(e.target).parent().siblings(".derp__content")
      let derpText = $originalDerp.text();
      // Replace the derp text
      let $modifiedText = $("<textarea>").addClass("edit-derp").val(derpText).attr("placeholder", derpText);
      $originalDerp.after($modifiedText).remove();
    } else if ($editButton.hasClass("derp__save")) {
      // Change "save" to "edit" on the button
      $editButton.text("Edit").removeClass("derp__save").addClass("derp__edit");
      let $modifiedDerp = $(e.target).parent().siblings("textarea");
      let originalText = $modifiedDerp.attr("placeholder");
      let modifiedText = $modifiedDerp.val();
      if (modifiedText !== originalText) {
        // Make a PUT request to /derps/:id
        let derpId = $editButton.closest(".derp").attr("data-derpId");
        $.ajax($editButton.attr("href"), {
          method: 'POST',
          data: {"id":derpId, "derp": modifiedText},
          success: function(data) {},
          error: function(data) {}
        });
      }
      let $derpElement = $('<p>').addClass("derp__content").text(modifiedText);
      $modifiedDerp.after($derpElement).remove();
    }
  });
});
