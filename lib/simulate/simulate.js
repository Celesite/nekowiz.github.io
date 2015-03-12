var Card, Enemy, cards, check_stage_clear, combo, current_enemies, current_stage, inital_enemy_data, load_cards, monsters, panel_color, play_stage, player_action, player_attack, props, randomNum, randomTurn, stages, start;

randomNum = function(max, min) {
  if (min == null) {
    min = 0;
  }
  return Math.floor(Math.random() * (max - min) + min);
};

cards = [];

combo = 0;

panel_color = 1;

Card = (function() {
  function Card(_at_id) {
    this.id = _at_id;
    this.load_done = false;
    $.ajax({
      url: "http://zh.nekowiz.wikia.com/wiki/%E6%A8%A1%E6%9D%BF:Card/Data/" + this.id + "?action=raw",
      cache: false,
      success: (function(_this) {
        return function(data) {
          var line, store_data, _i, _len, _ref, _ref1;
          store_data = function(line) {
            var index, value;
            index = line.slice(0, line.indexOf("="));
            value = line.slice(line.indexOf("=") + 1);
            if (index !== "") {
              return _this[index] = value;
            }
          };
          _ref = data.split("|").slice(1, -1);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            line = _ref[_i];
            store_data($.trim(line));
          }
          _this.current_hp = _this.max_hp;
          _this.current_cd = (_ref1 = _this.ss_cd === "") != null ? _ref1 : {
            "0": _this.ss_cd
          };
          _this.as_data = {};
          _this.ss_data = {};
          $.ajax({
            url: "http://zh.nekowiz.wikia.com/wiki/Template:Skill/Answer/Data?action=raw",
            cache: false,
            async: false,
            success: function(data) {
              var index, lines, skill_name, status, value, _j, _len1, _results;
              lines = data.split("\n");
              status = 0;
              _results = [];
              for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
                line = lines[_j];
                line = $.trim(line);
                if (line.indexOf("#switch: {{{data}}}") !== -1) {
                  skill_name = line.slice(1, +(line.indexOf("=") - 1) + 1 || 9e9);
                  if (skill_name === _this.as) {
                    _results.push(status = 1);
                  } else {
                    _results.push(void 0);
                  }
                } else if (status === 1) {
                  if (line.indexOf("}}") !== -1) {
                    _results.push(status = 0);
                  } else {
                    index = line.slice(line.indexOf("|") + 1, +(line.indexOf("=") - 1) + 1 || 9e9);
                    value = line.slice(line.indexOf("=") + 1);
                    if (index !== "") {
                      _results.push(_this["as_data"][index] = value);
                    } else {
                      _results.push(void 0);
                    }
                  }
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            }
          });
          $.ajax({
            url: "http://zh.nekowiz.wikia.com/wiki/Template:Skill/Special/Data?action=raw",
            cache: false,
            async: false,
            success: function(data) {
              var index, lines, skill_name, status, value, _j, _len1, _results;
              lines = data.split("\n");
              status = 0;
              _results = [];
              for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
                line = lines[_j];
                line = $.trim(line);
                if (line.indexOf("#switch: {{{data}}}") !== -1) {
                  skill_name = line.slice(1, +(line.indexOf("=") - 1) + 1 || 9e9);
                  if (skill_name === _this.ss) {
                    _results.push(status = 1);
                  } else {
                    _results.push(void 0);
                  }
                } else if (status === 1) {
                  if (line.indexOf("}}") !== -1) {
                    _results.push(status = 0);
                  } else {
                    index = line.slice(line.indexOf("|") + 1, +(line.indexOf("=") - 1) + 1 || 9e9);
                    value = line.slice(line.indexOf("=") + 1);
                    if (index !== "") {
                      _results.push(_this["ss_data"][index] = value);
                    } else {
                      _results.push(void 0);
                    }
                  }
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            }
          });
          _this.buffs = [];
          _this.attack_info = {};
          return _this.load_done = true;
        };
      })(this)
    });
  }

  Card.prototype.attack = function(enemies) {
    var atk, atk_value, attack_ratio, enemies_alive_count, enemy, i, target_enemy, _i, _j, _k, _len, _len1, _ref, _results;
    _results = [];
    for (i = _i = 1, _ref = this.attack_info.atk_times; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      if (this.attack_info.target_num === 1) {
        target_enemy = enemies[0];
        if (this.target !== -1) {
          if (enemies[this.target].is_dead()) {
            this.target = -1;
          }
        }
        if (this.target === -1) {
          for (_j = 0, _len = enemies.length; _j < _len; _j++) {
            enemy = enemies[_j];
            if (!enemy.is_dead()) {
              target_enemy = enemy;
              break;
            }
          }
        } else {
          target_enemy = enemies[this.target];
        }
        attack_ratio = this.attack_info.atk_ratio;
        if (this.attack.info.prop_atk.indexOf(enemy.prop) !== -1) {
          attack_ratio *= this.attack_info.prop_atk_ratio;
        }
        atk = Math.floor(this.max_atk * attack_ratio * (100 + combo) / 100);
        atk_value = enemy.damage(atk, this.prop);
        this.current_hp += atk_value * this.attack_info.life_drain;
        if (this.current_hp >= this.max_hp) {
          _results.push(this.current_hp = this.max_hp);
        } else {
          _results.push(void 0);
        }
      } else {
        atk = this.max_atk * this.attack_info.atk_ratio * (100 + combo) / 100;
        enemies_alive_count = 0;
        for (_k = 0, _len1 = enemies.length; _k < _len1; _k++) {
          enemy = enemies[_k];
          if (!enemy.is_dead()) {
            enemies_alive_count += 1;
          }
        }
        if (this.attack_info.target_all_average !== 0) {
          atk /= enemies_alive_count;
        }
        atk = Math.floor(atk);
        _results.push((function() {
          var _l, _len2, _results1;
          _results1 = [];
          for (_l = 0, _len2 = enemies.length; _l < _len2; _l++) {
            enemy = enemies[_l];
            _results1.push(enemy.damage(atk, this.prop));
          }
          return _results1;
        }).call(this));
      }
    }
    return _results;
  };

  Card.prototype.attack_info_set = function(prop, as_enable) {
    var atk_ratio, card, elmts_count, elmts_num, index, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _results, _results1;
    if (this.prop === prop) {
      if (as_enable) {
        switch (this.as_data.type) {
          case "攻擊上升":
            return this.attack_info.atk_ratio *= this.as_data.ratio / 100;
          case "連續攻擊":
            this.attack_info.atk_ratio *= this.as_data.ratio / 100 / this.as_data.atks;
            return this.attack_info.atk_times = this.as_data.atks;
          case "屬性特效":
            this.attack_info.prop_atk = this.as_data.elmts;
            return this.attack_info.prop_atk_ratio = this.as_data.ratio;
          case "全體攻擊（分散）":
            this.attack_info.atk_ratio *= this.as_data.ratio;
            this.attack_info.target_num = 5;
            return this.attack_info.target_all_average = 1;
          case "全體攻擊（不分散）":
            this.attack_info.atk_ratio *= this.as_data.ratio;
            this.attack_info.target_num = 5;
            return this.attack_info.target_all_average = 0;
          case "隨機攻擊":
            return this.attack_info.atk_ratio *= randomNum(this.as_data.ratio, 100) / 100;
          case "吸收":
            return this.attack_info.life_drain = this.as_data.ratio / 100;
          case "連段數攻擊上升":
            if (combo >= this.as_data.combo) {
              return this.attack_info.atk_ratio *= this.as_data.ratio / 100;
            }
            break;
          case "瀕死攻擊上升":
            if ((this.current_hp / this.max_hp) <= (this.as_data.hp / 100)) {
              return this.attack_info.atk_ratio *= this.as_data.ratio / 100;
            }
            break;
          case "快調攻擊上升":
            if ((this.current_hp / this.max_hp) >= (this.as_data.hp / 100)) {
              return this.attack_info.atk_ratio *= this.as_data.ratio / 100;
            }
            break;
          case "隊伍屬性攻擊上升":
            _results = [];
            for (_i = 0, _len = cards.length; _i < _len; _i++) {
              card = cards[_i];
              if (this.as_data.elmts.indexOf(card.prop) !== -1) {
                _results.push(card.attack_info.atk_ratio *= this.as_data.ratio / 100);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
            break;
          case "戰鬥不能攻擊上升":
            atk_ratio = 1;
            for (_j = 0, _len1 = cards.length; _j < _len1; _j++) {
              card = cards[_j];
              if (card.current_hp === 0) {
                atk_ratio += this.as_data.ratio / 100;
              }
            }
            return this.attack_info.atk_ratio *= atk_ratio;
          case "問答屬性數攻擊上升":
            index = "ratio" + panel_color;
            return this.attack_info.atk_ratio *= this.as_data[index];
          case "隊伍屬性數攻擊上升":
            elmts_count = {
              "火": 0,
              "水": 0,
              "雷": 0
            };
            _ref = cards.slice(0, -1);
            for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
              card = _ref[_k];
              elmts_count[card.prop] = 1;
            }
            elmts_num = elmts_count["火"] + elmts_count["水"] + elmts_count["雷"];
            index = "ratio" + elmts_num;
            return this.attack_info.atk_ratio *= this.as_data[index];
          case "自身回復":
            if (this.as_data.mode === "%數") {
              this.current_hp += this.max_hp * this.as_data.ratio / 100;
            } else if (this.as_data.mode === "絕對值") {
              this.current_hp += this.as_data.ratio;
            }
            this.current_hp = Math.floor(this.current_hp);
            if (this.current_hp > this.max_hp) {
              return this.current_hp = this.max_hp;
            }
            break;
          case "屬性回復":
            _ref1 = cards.slice(0, -1);
            _results1 = [];
            for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
              card = _ref1[_l];
              if (this.as_data.elmts.indexOf(card.prop) !== -1) {
                if (this.as_data.mode === "%數") {
                  card.current_hp += card.max_hp * this.as_data.ratio / 100;
                } else if (this.as_data.mode === "絕對值") {
                  card.current_hp += this.as_data.ratio;
                }
                card.current_hp = Math.floor(card.current_hp);
                if (card.current_hp > card.max_hp) {
                  _results1.push(card.current_hp = card.max_hp);
                } else {
                  _results1.push(void 0);
                }
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
        }
      }
    }
  };

  Card.prototype.target_reset = function() {
    return this.target = -1;
  };

  Card.prototype.target_set = function(target_index) {
    return this.target = target_index;
  };

  Card.prototype.attack_info_reset = function() {
    this.attack_info.atk_ratio = 1;
    this.attack_info.target_num = 1;
    this.attack_info.target_all_average = 0;
    this.attack_info.atk_times = 1;
    this.attack_info.prop_atk = "";
    this.attack_info.prop_atk_ratio = 1;
    return this.attack_info.life_drain = 0;
  };

  return Card;

})();

load_cards = function() {
  var card_id, i, _i, _results;
  _results = [];
  for (i = _i = 1; _i <= 6; i = ++_i) {
    card_id = $("#card" + i).val();
    _results.push(cards[i - 1] = new Card(card_id));
  }
  return _results;
};

props = {
  "火": {
    "火": 1.0,
    "水": 0.5,
    "雷": 1.5
  },
  "水": {
    "火": 1.5,
    "水": 1.0,
    "雷": 0.5
  },
  "雷": {
    "火": 0.5,
    "水": 1.5,
    "雷": 1.0
  }
};

monsters = {
  997: {
    name: "黃金色武士亡靈",
    prop: "雷"
  },
  104: {
    name: "閃電之魔導書",
    prop: "雷"
  },
  998: {
    name: "奮起於月夜中的鎧甲武士",
    prop: "雷"
  },
  107: {
    name: "白銀寶壺",
    prop: "雷"
  },
  995: {
    name: "蒼色武士亡靈",
    prop: "水"
  }
};

stages = [[[997, 8000, 1, 1, 400, [0]], [997, 8000, 1, 1, 400, [0]], [104, 5500, 1, 5, 150, [0]]], [[998, 12000, 2, 1, 400, [0]], [107, 10000, 1, 1, 600, [0]], [995, 6000, 2, 1, 675, [0]]]];

randomTurn = function(turn) {
  var max, min;
  max = turn + 1;
  min = turn - 1;
  if (min <= 0) {
    min = 1;
  }
  return randomNum(max, min);
};

Enemy = (function() {
  function Enemy(enemy_data) {
    this.id = enemy_data[0];
    this.max_hp = enemy_data[1];
    this.current_hp = enemy_data[1];
    this.turn = enemy_data[2];
    this.current_turn = randomTurn(enemy_data[2]);
    this.target = enemy_data[3];
    this.atk = enemy_data[4];
    this.ai = enemy_data[5];
    this.name = monsters[this.id].name;
    this.prop = monsters[this.id].prop;
    this.current_ai_index = 0;
    this.buffs = [];
  }

  Enemy.prototype.is_dead = function() {
    return this.current_hp === 0;
  };

  Enemy.prototype.damage = function(atk, prop) {
    var atk_value;
    atk_value = atk * props[prop][this.prop];
    if (atk_value > this.current_hp) {
      atk_value = this.current_hp;
    }
    this.current_hp -= atk_value;
    return atk_value;
  };

  Enemy.prototype.attack = function() {
    return this.atk;
  };

  return Enemy;

})();

inital_enemy_data = function(stage) {
  var enemy;
  return (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = stage.length; _i < _len; _i++) {
      enemy = stage[_i];
      _results.push(new Enemy(enemy));
    }
    return _results;
  })();
};

check_stage_clear = function(enemies) {
  var enemy, _i, _len;
  for (_i = 0, _len = enemies.length; _i < _len; _i++) {
    enemy = enemies[_i];
    if (!enemy.is_dead()) {
      return false;
    }
  }
  return true;
};

player_action = function() {
  enable_skills();
  return enable_attacks();
};


/*
player_use_skill = (skill) ->
	switch skill.type
		when "單體攻擊"
		when "全體攻擊"
		when "單體百分比攻擊"
		when "全體百分比攻擊"
		when "單體HP消耗攻擊"
		when "毒傷攻擊"
		when "屬性指定回復"
		when "全體回復"
		when "復活"
		when "獻身"
		when "攻擊力增加型"
		when "傷害減輕型"
		when "攻擊回合延遲型"
		when "傷害集中型"
			return
 */

player_attack = function(prop, as_enable) {
  var card, _i, _len, _ref, _results;
  if (as_enable == null) {
    as_enable = true;
  }
  _ref = cards.slice(0, -1);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    card = _ref[_i];
    _results.push(card.attack(prop, as_enable));
  }
  return _results;
};

play_stage = function(stage) {
  var current_enemies;
  current_enemies = inital_enemy_data(stage);
  return player_action();

  /*
  	enemy_action()
  	if check_gameover
  		gameover()
  		return false
   */
};

current_stage = 0;

current_enemies = [];

start = function() {
  current_stage = 0;
  return play_stage(stages[current_stage]);
};

$(function() {
  return $("#load_card").on("click", function() {
    return load_cards();
  });
});

// ---
// generated by coffee-script 1.9.0