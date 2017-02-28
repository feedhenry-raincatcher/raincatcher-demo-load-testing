'use strict';

module.exports = function makeWorkflow(id) {
  return {
    "id": id,
    "title": "test",
    "steps": [
      {
        "templates": {
          "view": "<p>hello</p>"
        },
        "code": "t1",
        "name": "test step",
        "$$hashKey": "object:1563"
      }
    ]
  };
};
