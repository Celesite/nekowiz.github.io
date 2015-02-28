function get_page_title_by_id(problem_id) {
	return "模板:題庫/每日/" + (Math.floor((problem_id - 1) / 500) + 1).toString();
}

function errorHandler() {
	$("#msg").html("新增時發生錯誤，請重新嘗試").delay(1000).hide(1000);
	$("#problem_info").delay(1000).show(1000);
}

upload_status = {
	image: false,
	problem: false
};

function check_complete() {
	if (upload_status.image == true && upload_status.problem == true) {
		$("#msg").html("題目新增完成").delay(1000).hide(1000);
		$("#problem_info").delay(1000).show(1000);
		$("#problem").val("");
		$("#answer").val("");
		$("#image").val("");
	}
}

function createNewProblem() {
	var file = $("#image")[0].files[0];
	var file_name = file.name;
	
	var problem = $.trim($("#problem").val());
	var answer = $.trim($("#answer").val());
	
	if (problem == "" || answer == "" || file_name == "") {
		$("#msg").hide().html("題目或答案不得為空白").show(1000);
		return;
	}
	
	// Disable all forms
	$("#problem_info").hide(1000);
	$("#msg").hide(1000).html("新增題目中...").show(1000);
 
	// 取得目前題號
	$.ajax({
		url: "http://zh.nekowiz.wikia.com/api.php?action=query&titles=%E6%A8%A1%E6%9D%BF:%E9%A1%8C%E5%BA%AB/%E6%AF%8F%E6%97%A5&prop=info|revisions&inprop=&intoken=edit&rvprop=timestamp|content&format=json",
		cache: false
	}).done(function (data) {
		var pages = data.query.pages;
		var page;
		for (var index in pages) {
			page = pages[index];
		}
		var starttimestamp = page.starttimestamp;
		var content = page.revisions[0]["*"];
		
		var new_problem_id = parseInt(content) + 1;
		var image_name = "每日問答-" + new_problem_id.toString() + file_name.substr(file_name.lastIndexOf("."));
		// Create new problem page
		var new_content = "\n" + new_problem_id.toString() + "|" + problem + "|" + answer + "|" + image_name;
		var title = get_page_title_by_id(new_problem_id);
		
		// 更新最大題號
		// Update Max Problem ID
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: {
				format: 'json',
				action: 'edit',
				title: "模板:題庫/每日",
				text: new_problem_id.toString(),
				token: mw.user.tokens.get('editToken'),
				starttimestamp: starttimestamp
			},
			dataType: 'json',
			type: 'POST',
			cache: false,
			success: function( data ) {
				if ( data && data.edit && data.edit.result == 'Success' ) {
					// 更新題號成功
					// 上傳圖片
					
					var formdata = new FormData();
					formdata.append("action", "upload");
					formdata.append("filename", image_name);
					formdata.append("token", mw.user.tokens.get( 'editToken' ) );
					formdata.append("file", file);
					formdata.append("ignorewarnings", "1");
					
					$.ajax( { 
						url: mw.util.wikiScript( 'api' ), //url to api.php 
						contentType:false,
						processData:false,
						type:'POST',
						data: formdata,
						success:function(data){
							//do what you like, console logs are just for demonstration :-)
							upload_status.image = true;
							check_complete();
						},
						error:function(xhr,status, error){
							errorHandler();
						}
					});
					
					// 新增題目
					$.ajax({
						url: mw.util.wikiScript('api'),
						data: {
							format: 'json',
							action: 'edit',
							title: title,
							appendtext: new_content,
							token: mw.user.tokens.get('editToken')
						},
						dataType: 'json',
						type: 'POST',
						cache: false,
						success: function( data ) {
							if ( data && data.edit && data.edit.result == 'Success' ) {
								// 成功新增題目
								upload_status.problem = true;
								check_complete();
							} else if ( data && data.error ) {
								errorHandler();
								// alert( 'Error: API returned error code "' + data.error.code + '": ' + data.error.info );
							} else {
								errorHandler();
								// alert( 'Error: Unknown result from API.' );
							}
						},
						error:	function( xhr ) {
							errorHandler();
							// alert( 'Error: Request failed.' );
						}
					});
				} else if ( data && data.error ) {
					errorHandler();
					// alert( 'Error: API returned error code "' + data.error.code + '": ' + data.error.info );
				} else {
					errorHandler();
					// alert( 'Error: Unknown result from API.' );
				}
			},
			error: function( xhr ) {
				errorHandler();
				// alert( 'Error: Request failed.' );
			}
		});
	});
}