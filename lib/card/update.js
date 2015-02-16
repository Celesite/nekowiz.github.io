function get_page_title_by_id(card_id) {
	var card_id_low = Math.floor((card_id - 1) / 20) * 20 + 1;
	var card_id_high = card_id_low + 19;
	return "�ҪO:Card/Data/" + card_id_low.toString() + "-" + card_id_high.toString();
}

function getCardDataf() {
	// ���÷j�M��
	$("#search").hide(1000);
	$("#msg").html("Ū���d����Ƥ�...").show(1000);

	// �d���s��
	var card_id = parseInt($("#card_id").val());
	
	// �ھڽs�����o page title
	var title = get_page_title_by_id(card_id);
	
	// ���o�ӭ������
	$.ajax({
		url: "http://zh.nekowiz.wikia.com/wiki/" + title + "?action=raw",
		cache: false
	}).done(function (data) {
		var card_data_split = data.split("\n");
		var card_data = {};
		var status = 0;
		for (var line_index in card_data_split) {
			var line = card_data_split[line_index];
			if (status == 0 && line[0] == "|" && line.substr(1, line.search("=") - 1) == card_id.toString()) {
				 status = 1;
				 card_data["id"] = card_id.toString();
			} else if (status == 1) {
				if (line[0] == "}") {
					break;
				} else {
					var before = line.substr(line.search("\\|")+1, line.search("=") - line.search("\\|") - 1);
					var after = line.substr(line.search("=")+1);
					if (before != "") {
						card_data[before] = after;
					}
				}
			}
		}
		
		var keys = [
			['prop', '�ݩ�'],
			['breed', '�ر�'],
			['rank', 'Rank'],
			['name', '�d���W��'],
			['max_atk', '�̰������O'],
			['max_hp', '�̰���q'],
			['cost', 'Cost'],
			['card_filename', '�d���j�ϦW��'],
			['small_filename', '�d���p�ϦW��'],
			['evo_now', '�ثe�i�Ưż�'],
			['evo_max', '�̰��i�Ưż�'],
			['max_level', '�̰�����'],
			['as', '���D�ޯ�'],
			['ss', '�S��ޯ�'],
			['ss_cd', '�S��ޯ�N�o�^�X��'],
			['evo_1', '�i�ƥd��1 ID'],
			['evo_2', '�i�ƥd��2 ID'],
			['evo_3', '�i�ƥd��3 ID'],
			['evo_4', '�i�ƥd��4 ID'],
			['evo_5', '�i�ƥd��5 ID'],
			['evo_6', '�i�ƥd��6 ID'],
			['evo_7', '�i�ƥd��7 ID'],
			['evo_8', '�i�ƥd��8 ID'],
			['evo_price', '�i�Ʃһݪ���'],
			['sell_price', '�c����o����'],
			['evo_from', '�i�Ʀۥd�� ID'],
			['evo_to', '�i�Ƭ��d�� ID']
		];
		
		// ���ͽs����
		var table_elem = $("<table class='article-table'><tr><th>�d�� ID</th><td>" + card_data["id"] + "</td></tr></table>");
		for (var key_index in keys) {
			var key = keys[key_index];
			table_elem.append("<tr><th>" + key[1] + "</th><td><input type='text' id='" + key[0] + "' value='" + (card_data[key[0]] == undefined ? "" : card_data[key[0]]) + "' /></td></tr>");
		}
		$("#msg").html("Ū������").hide(1000);
		$("#data").html(table_elem).show(1000);
	});
}

$(document).ready(function () {
	$("#get_card").on('click', function() {
		getCardData();
	});
});