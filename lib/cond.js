// Lisp COND macro, sort of

module.exports = function cond() {
  var done;
  var args = [].slice.call(arguments);
  args
    .forEach(function(t, i) {
      if (done || i % 2) return;
      if (t === true || t()) done = i + 1;
    });
  return args[done];
};
