const DATA = {
  three10: {
    html: '<div class="btns"><button data-id="1">texture1</button><button data-id="2">texture2</button><button data-id="3">texture3</button><button data-id="4">texture4</button></div>',
  },
};

export const addHTML = (html) => (document.querySelector(".contents-btn").innerHTML = html);

export const $ = (elem) => document.querySelector(elem);

export const $$ = (elem) => document.querySelectorAll(elem);

export default DATA;
