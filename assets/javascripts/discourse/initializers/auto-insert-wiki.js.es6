import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

function initWithApi(api) {
  api.decorateCooked((cooked) => {
    Ember.run.next(cooked, function() {
      const el = this.find("strong:contains(wiki_edit_btn)");
      const topic = $("#topic");

      if (el.length && topic.length) {
        const parent = el.parent("p");
        const currentUser = Discourse.User.current();
        const btn = $(`<button class="btn btn-large btn-primary ${currentUser ? '' : 'disabled'}">Add Summary</button>`);
        const topicId = topic.data("topic-id");

        btn.click(function() {
          if ($(this).hasClass("disabled")) return;

          const message = "You are about to add a blank Summary template to this topic. Please do this only if you will contribute to the summary. Are you sure?";

          const buttons = [
            {
              label: "No",
              class: "btn-danger"
            },
            {
              label: "Yes",
              class: "btn-primary",
              callback: () => {
                $(this).addClass("disabled");

                ajax("/auto-insert-wiki", { type: "POST", data: { id: topicId } })
                  .then((result) => {
                    //console.log(result);
                  })
                  .catch(popupAjaxError)
                  .finally(() => {
                    $(this).removeClass("disabled");
                  });
              }
            }
          ];

          bootbox.dialog(message, buttons);
        });

        parent.html(btn);
      }
    });
  }, { onlyStream: true });
}

export default {
  name: "auto-insert-wiki",
  initialize() {
    withPluginApi("0.8", initWithApi);
  }
}
