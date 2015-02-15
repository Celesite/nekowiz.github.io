q_data = {
	normal: [],
	sort: [],
	daily: []
};

taffy_dbs = {
};

function load4select() {
	// 取得目前最大題號
	$.ajax({
		url: "http://zh.nekowiz.wikia.com/wiki/模板:題庫/四選一?action=raw",
		cache: false
	}).done(function (data) {
		var max_problem_id = parseInt(data);
		// 根據最大題號得到最大題目頁面
		var max_problem_page = (Math.floor((max_problem_id - 1) / 500) + 1);
		// 獲取每個頁面的題目
		var loaded_pages = 0;
		for (var current_problem_page = 1; current_problem_page <= max_problem_page; current_problem_page+=1) {
			// 取得每個題目頁面的 title
			var title = "模板:題庫/四選一/" + current_problem_page.toString();
			// 取得題目
			$.ajax({
				url: "http://zh.nekowiz.wikia.com/wiki/" + title + "?action=raw",
				cache: false
			}).done(function (data) {
				// parse 題目
				var data_arr = $.trim(data).split("\n");
				for (var question_index in data_arr) {
					var question = data_arr[question_index];
					var question_arr = $.trim(question).split("|");
					tmp = {}
					tmp["id"] = question_arr[0];
					tmp["gen"] = question_arr[1];
					tmp["question"] = question_arr[2];
					tmp["answer"] = question_arr[3];
					q_data.normal.push(tmp);
				}
				loaded_pages += 1;
				$("#msg").html("題目讀取中...<br />讀取進度 " + Math.round(loaded_pages/max_problem_page*100).toString() + "%");
				if (loaded_pages == max_problem_page) {
					$("#search").show(1000);
					$("#result").show(1000);
					$("#msg").hide(1000);
					taffy_dbs["normal"] = TAFFY(q_data.normal);
				}
			});
		}
	});
}

function search_problem() {
	// 取得題目內容
	var question = $.trim($("#question").val());
	// 搜尋
	if (question == "") {
		$("#result").html("");
	} else {
		var db_result = taffy_dbs["normal"]({question: {like: question}});
		var search_result_html = "<table><tr><th>類型</th><th>題目</th><th>答案</th></tr>";
		db_result.each(function (record,recordnumber) {
			search_result_html += "<tr><td>" + record["gen"] + "</td><td>" + record["question"] + "</td><td>" + record["answer"] + "</td></tr>";
		});
		search_result_html += "</table>";
		$("#result").html(search_result_html);
	}
}

$(document).ready(function() {
	$("#question").on({
		keyup: search_problem
	});
	load4select();
});