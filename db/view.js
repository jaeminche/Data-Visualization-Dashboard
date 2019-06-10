var v = {
  init: function() {
    // this.catElem = document.getElementById('cat');

    this.render();
  },

  render: function() {
    var currentCat = octopus.getCurrentCat();
    this.catCountElem.textContent = currentCat.clickCount;
  }
};
