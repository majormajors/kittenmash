var models = require('./models');

exports.scores = {
  index : function(req, res) {
    models.Score.find({}, function(err, docs){
      res.send(docs);
    });
  },

  create : function(req, res) {
    var score = new models.Score({
        nickname : req.body.nickname
      , value : req.body.value
      , created_at : new Date
    });

    score.save(function(err) {
      if(err)
        res.send({ error : "Failed to save score" }, 400);
      else
        res.send(score, 201);
    });
  },

  show : function(req, res) {
    models.Score.findById(req.params.score, function(err, doc) {
      if(err)
        res.send({ error : "Score not found" }, 404);
      else
        res.send(doc);
    });
  }
};
