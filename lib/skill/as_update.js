as_skill_index = {
	"�����t": {
		"�����W��": ["ratio"],
		"�s�����": ["ratio", "atks"],
		"�ݩʯS��": ["ratio", "elmts"],
		"��������]�����^": ["ratio"],
		"��������]�������^": ["ratio"],
		"�H������": ["ratio"],
		"�l��": ["ratio"],
		"�s�q�Ƨ����W��": ["ratio", "combo"],
		"�x�������W��": ["ratio", "hp"],
		"�ֽէ����W��": ["ratio", "hp"],
		"�����ݩʧ����W��": ["ratio", "elmts"],
		"�԰���������W��": ["ratio"],
		"�ݵ��ݩʼƧ����W��": ["ratio1", "ratio2", "ratio3"],
		"�����ݩʼƧ����W��": ["ratio1", "ratio2", "ratio3"]
	},
	"�^�_�t": {
		"�ۨ��^�_": ["mode", "ratio"],
		"�ݩʦ^�_": ["mode", "ratio", "elmts"]
	}
};

as_skills = {};

function get_as_skill() {
	// ���ھ� type ���͹������
	var as_skill_name = $("#as_skill_name").val();
	var as_type = $("#as_type").val();
	var as_args_type = [];
	for (var skill_group in as_skill_index) {
		for (var skill_type in as_skill_index[skill_group]) {
			if (as_type == skill_type) {
				as_args_type = as_skill_index[skill_group][skill_type];
			}
		}
	}
	
	// �q as_skills �̭����o�������ޯ���
	var as_skill_data = as_skills[as_skill_name];
	
	var table_elem = $("<table class='article-table'></table>");
	table_elem.append("<tr><th>�ޯ�W��</th><td>" + as_skill_name + "</td></tr>");
	for (var data_index in as_skill_data) {
		var type_name = as_skill_data[data_index];
		table_elem.append("<tr><th>" + type_name + "</th><td><input type='text' id='" + type_name + "' /></td></tr>");
	}
	$("#data").html(as_skill_data);
}

function load_as_skill() {
	// ���o�ӭ������
	$.ajax({
		url: "http://zh.nekowiz.wikia.com/wiki/Template:Skill/Answer/Data?action=raw",
		cache: false
	}).done(function (data) {
		var data_split = data.split("\n");
		var status = 0;
		var current_as_skill_data = {};
		for (var line in data_split) {
			line = $.trim(data_split[line]);
		if (line[0] != "|" && line[0] != "}") {
				continue;
			}
			
			// �٨S���b�ޯ�̭�
			if (status == 0) {
				if (line.search("switch") == -1) {
					continue;
				}
				var equal_pos = line.search("=");
				current_as_skill_data = {};
				current_as_skill_data["as_skill_name"] = line.substr(1, equal_pos - 1);
				current_as_skill_data["as_skill_data"] = {};
				status = 1;
			}
			// �b�ޯ�̭�
			else if (status == 1) {
				// �ޯ൲��
				if (line.search("}}") != -1) {
					as_skills[current_as_skill_data["as_skill_name"]] = current_as_skill_data["as_skill_data"];
					// as_skills.push(current_as_skill_data);
					status = 0;
					continue;
				}
				// �S����ƪ����
				var equal_pos = line.search("=");
				if (equal_pos == -1) {
					continue;
				}
				// �x�s���
				var skill_index = line.substr(1, equal_pos - 1);
				var skill_data = line.substr(equal_pos + 1);
				current_as_skill_data["as_skill_data"][skill_index] = skill_data;
			}
		}
		
		// ���Ū������
		$("#msg").html("�ޯ���Ū������").delay(1000).hide();
		$("#search").delay(1000).show();
	});
}

$(document).ready(function () {
	// ���� select
	var as_type_select = $("#as_type");
	var element_str = "";
	for (var skill_type in as_skill_index) {
		element_str += "<optgroup label='" + skill_type + "'>";
		for (var skill_name in as_skill_index[skill_type]) {
			element_str += "<option value='" + skill_name + "'>" + skill_name + "</option>";
		}
		element_str += "</optgroup>";
	}
	as_type_select.append(element_str);
	
	// ���U onclick event
	$("#get_as_skill").on("click", function() {
		get_as_skill();
	});
	
	// Ū���ޯ���
	$("#msg").html("Ū���ޯ��Ƥ�...");
	
	load_as_skill();
});