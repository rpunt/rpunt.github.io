/* When the DOM is ready... */
$(function(){
	
	// Hide stuff with the JavaScript. If JS is disabled, the form will still be useable.
	// NOTE:
	// Sometimes using the .hide(); function isn't as ideal as it uses display: none; 
	// which has problems with some screen readers. Applying a CSS class to kick it off the
	// screen is usually prefered, but since we will be UNhiding these as well, this works.
	$(".name_wrap, #company_name_wrap, #special_accommodations_wrap, #tuition_assistance_wrap").hide();
	
	// Reset form elements back to default values on page load
	// ... don't want browser remembering values like checked checkboxes in this case
	$("#verify_step_1").attr("disabled",true);
	$("#submit_button").attr("disabled",true);
	
	$("#num_attendees").val('Please Choose');
	$("#step_2").each(function(){
		this.checked = false;
	});
	$("#step_3").each(function(){
		this.checked = false;
	});
	
	// MTO price list
	var member_tuition = 1320;
	var nonmember_tuition = 3400;
	var pto_fee = 30;
	var registration_fee = 130;
	var book_fee = 45;
	var tech_fee = 40;
	var assignment_book_fee = 3.65;
	var catechism_book_fee = 18.5;
	var bible_fee = 6;
	var hymnal_fee = 21.5;
	var extracurricular_fee = 40;
	var members;
	var numAttendees;
	var assignment_book_total = 0; 
	var catechism_total = 0; 
	var bible_total = 0; 
	var hymnal_total = 0;
	var extracurricular_total = 0;
	var total = 0;
	
	var family = {
		"members": "",
		"additional_gift": 0,
		"tuition": 0,
		"required_fees": {
			"pto_fee": 0,
			"registration_fee": 0,
			"book_fee": 0,
			"tech_fee": 0
		},
		"students": [],
		"deductions": {
			"ontime_registration": 0,
			"paid_in_full": 0,
			"tuition_assistance": 0
		}
	};
	
	// Fade out steps 2 and 3 until ready
	$("#step_2, #step_3").css({ opacity: 0.3 });
	
	$.stepTwoComplete_one = "not complete";
	$.stepTwoComplete_two = "not complete"; 
	
	family.members = $("#members").val();
	family.students = [];
	
	$("#members").change(function() {
		family.members = $("#members").val();
		recalculateTuition();
	});
	
	// number of students
	$("#num_attendees").change(function() {	
		$(".name_wrap").slideUp().find("input").removeClass("active_name_field");
        numAttendees = $("#num_attendees").val();
        $("#verify_step_1").attr("disabled",false);
        
        $("#students_optional_fees_wrap").slideUp();
        $("#students_optional_fees_wrap").empty();
        
        for ( i=1; i<=numAttendees; i++ ) {
            $("#attendee_" + i + "_wrap").slideDown().find("input").addClass("active_name_field");
            $("#attendee_" + i + "_wrap").slideDown().find("select").addClass("grade_selector");
            
            $("#students_optional_fees_wrap").append('<legend id="attendee_legend_' + i + '"></legend>');
            
            $("#students_optional_fees_wrap").append('<div id="student_' + i + '_optional_fees" class="student_additional_fees_wrap">');
			$("#students_optional_fees_wrap").append('<input type="checkbox" name="assignmant_book_' + i + '" id="assignment_book_' + i + '">&nbsp;');
			$("#students_optional_fees_wrap").append('<label for="assignment_book_' + i + '">Assignment Book</label><br />');
			
			$("#students_optional_fees_wrap").append('<input type="checkbox" name="catechism_book_' + i + '" id="catechism_book_' + i + '">&nbsp;');
			$("#students_optional_fees_wrap").append('<label for="catechism_book_' + i + '">Catechism Book</label><br />');
			
			$("#students_optional_fees_wrap").append('<input type="checkbox" name="bible_' + i + '" id="bible_' + i + '">&nbsp;');
			$("#students_optional_fees_wrap").append('<label for="bible_' + i + '">Bible</label><br />');
			
			$("#students_optional_fees_wrap").append('<input type="checkbox" name="hymnal_' + i + '" id="hymnal_' + i + '">&nbsp;');
			$("#students_optional_fees_wrap").append('<label for="hymnal_' + i + '">Hymnal</label><br />');
			$("#students_optional_fees_wrap").append('</div>');
			
			$("#students_optional_fees_wrap").append('<br />');
			$("#students_optional_fees_wrap").append('<hr />');
			$("#students_optional_fees_wrap").append('<br />');
        }
        $("#students_optional_fees_wrap").slideDown();
        
        family.required_fees.pto_fee = (numAttendees > 1) ? 30 : 20;
        $("#breakdown_pto").html(formatCurrency(family.required_fees.pto_fee));
		
		recalculateTuition();		
		
		console.log(family);
	});
	
	// Check completeness of fields quickly
/* 	$(".name_input").keyup(function() { */
	$("#add_students").click(function() {
		var all_complete = true;
		family.students = [];
		
		$(".active_name_field").each(function(index) {
			console.log("index on active_name_field: " + index);
			var i = index + 1;
			if ($(this).val() == '' ) {
				all_complete = false;
			} else {
				$("#attendee_legend_" + (i)).html($(this).val());
				var student = {
					"name": "",
					"grade": -1,
					"additional_fees": {
						"assignment_book": 0,
						"catechism": 0,
						"bible": 0,
						"hymnal": 0,
						"extra_curricular": 0,
						"other": 0
					}
				};
				student.name = $(this).val();
				family.students.push(student);
			}
			console.log("created student at index " + index);
			console.log(family.students[index]);
		});
		$(".grade_selector").each(function(index) {
			var i = index + 1;
			console.log("index on grade_selector: " + index);
			if ($(this).val() == 'x' ) {
				all_complete = false;
			} else { 
				family.students[index].grade = parseInt($(this).val());
				
				console.log("students[" + index + "]:" + family.students[index].grade);
				
				$("#assignment_book_" + i).attr("disabled",true);
				$("#catechism_book_" + i).attr("disabled",true);
				$("#bible_" + i).attr("disabled",true);
				$("#hymnal_" + i).attr("disabled",true);
			
				if (family.students[index].grade >= 3) {
					family.students[index].additional_fees.extra_curricular = 40; 
					$("#breakdown_extra_curricular").html(formatCurrency(family.students[index].additional_fees.extra_curricular));
					$("#bible_" + i).attr("disabled",false);
					$("#hymnal_" + i).attr("disabled",false); 
					if (family.students[index].grade <= 6) { 
						$("#assignment_book_" + i).attr("disabled",false); 
					}
					if (family.students[index].grade >= 5) { 
						$("#catechism_book_" + i).attr("disabled",false); 
					}
				}
			};
		});
		
		// place the "done" checkmark
		if (all_complete) {
			$("#step_1")
				.animate({
					paddingBottom: 120
				})
				.css({
					"background-image": "url(images/check.png)",
					"background-position": "bottom center",
					"background-repeat": "no-repeat"
				});
			$("#step_2").css({
				opacity: 1
			});
			$("#step_2 legend").css({
				opacity: 1 // For dumb Internet Explorer
			});
		} else { // not complete
			$("#step_1")
				.animate({
					paddingBottom: 20
				})
				.css({
					"background-image": "none"
				});
		};
		calculateTotal();
	});

	$("#calculate_additional_fees").click(function() {
		var all_complete = true;
		
		$(".student_additional_fees_wrap").each(function(index) {
			console.log("index on student_additional_fees_wrap: " + index);
			var i = index + 1;

			if ($("#assignment_book_" + i + ":checked").val() == 'on') { family.students[index].additional_fees.assignment_book = assignment_book_fee; }
			if ($("#catechism_book_" + i + ":checked").val() == 'on') { family.students[index].additional_fees.catechism = catechism_book_fee; }
			if ($("#bible_" + i + ":checked").val() == 'on') { family.students[index].additional_fees.bible = bible_fee; }
			if ($("#hymnal_" + i + ":checked").val() == 'on') { family.students[index].additional_fees.hymnal = hymnal_fee; }
			console.log(family.students[index].additional_fees);
		});
		var abf = 0; var c = 0; var b = 0; var h = 0; var e = 0;
		$(family.students).each(function(index) {
			abf += family.students[index].additional_fees.assignment_book;
			c += family.students[index].additional_fees.catechism;
			b += family.students[index].additional_fees.bible;
			h += family.students[index].additional_fees.hymnal;
			e += family.students[index].additional_fees.extra_curricular;
		})
		$("#breakdown_assignment_book").html(formatCurrency(abf));
		$("#breakdown_catechism").html(formatCurrency(c));
		$("#breakdown_bible").html(formatCurrency(b));
		$("#breakdown_hymnal").html(formatCurrency(h));
		$("#breakdown_extra_curricular").html(formatCurrency(e));
		assignment_book_total = abf;
		catechism_total = c;
		bible_total = b;
		hymnal_total = h;
		extracurricular_total = e;
		
		// place the "done" checkmark
		if (all_complete) {
			$("#step_3").css({
				opacity: 1
			});
			$("#step_3 legend").css({
				opacity: 1 // For dumb Internet Explorer
			});
		};
		calculateTotal();
	});
	
	function recalculateTuition() {
		if (family.members == "yes") {
			family.tuition = (numAttendees >= 2) ? 2 * member_tuition : numAttendees * member_tuition;
		} else {
			family.tuition = (numAttendees >= 3) ? 2.5 * nonmember_tuition : numAttendees * nonmember_tuition;
		}
		family.required_fees.book_fee = numAttendees * book_fee;
		family.required_fees.registration_fee = numAttendees * registration_fee;
		family.required_fees.tech_fee = numAttendees * tech_fee;
		
		$("#breakdown_registration_fee").html(formatCurrency(family.required_fees.registration_fee));
		$("#breakdown_tuition").html(formatCurrency(family.tuition));
		$("#breakdown_book_fee").html(formatCurrency(family.required_fees.book_fee));
		$("#breakdown_tech_fee").html(formatCurrency(family.required_fees.tech_fee));
		
		if ($("#paid_in_full:checked").val() == 'on') { 
			family.deductions.paid_in_full = family.tuition * .05;
		} else {
			family.deductions.paid_in_full = 0;
		}
		$("#breakdown_paid_in_full").html(formatCurrency(family.deductions.paid_in_full)); 
/* 		$("#breakdown_paid_in_full").html(family.deductions.paid_in_full.formatCurrency()); */
		
		calculateTotal();
	};
	
	$("#dump_button").click(function() {
		console.log(family);
	});
	
	$("#on_time_registration").click(function() {
		if (this.checked) {
			family.deductions.ontime_registration = 50;
		} else {
			family.deductions.ontime_registration = 0;
		}
		$("#breakdown_ontime_registration").html(formatCurrency(family.deductions.ontime_registration));
		calculateTotal();
	});
	
	$("#paid_in_full").click(function() {
		recalculateTuition();
		calculateTotal();
	});
	
	$("#tuition_assistance").click(function(){
		if ($("#tuition_assistance:checked").val() == 'on') {
			$("#tuition_assistance_wrap").slideDown();
		} else {
			$("#tuition_assistance_wrap").slideUp();
			family.deductions.tuition_assistance = 0;
			$("#breakdown_tuition_assistance").html(formatCurrency(family.deductions.tuition_assistance));
		};
	});
	
	$(".tuition_assistance_amount").keyup(function() {
		family.deductions.tuition_assistance = parseInt($("#tuition_assistance_amount").val());
		$("#breakdown_tuition_assistance").html(formatCurrency(family.deductions.tuition_assistance));
	});
	
	$("#calculate_total").click(function() {
		calculateTotal();
	});
	
	function calculateTotal() {
		$("#submit_button").attr("disabled",false);
		$("#breakdown_registration_fee").html(formatCurrency(family.required_fees.registration_fee));
		$("#breakdown_tuition").html(formatCurrency(family.tuition));
		$("#breakdown_book_fee").html(formatCurrency(family.required_fees.book_fee));
		$("#breakdown_tech_fee").html(formatCurrency(family.required_fees.tech_fee));
		
		var required_fees = family.tuition + family.required_fees.registration_fee + family.required_fees.book_fee + family.required_fees.tech_fee + family.required_fees.pto_fee;
		var additional_fees = assignment_book_total + catechism_total + bible_total + hymnal_total + extracurricular_total;
		var deductions = family.deductions.ontime_registration + family.deductions.paid_in_full + family.deductions.tuition_assistance;
		console.log("required fees: " + required_fees);
		console.log("additional fees: " + additional_fees);
		console.log("deductions: " + deductions);
		total = required_fees + additional_fees - deductions;
		$("#breakdown_grand_total").html(formatCurrency(total));
	}
	
	function formatCurrency(input) {
		return "$" + input;
	}

/*
	function stepTwoTest() {
		if (($.stepTwoComplete_one == "complete") && ($.stepTwoComplete_two == "complete")) {
			$("#step_2")
			.animate({
				paddingBottom: 120
			})
			.css({
				"background-image": "url(images/check.png)",
				"background-position": "bottom center",
				"background-repeat": "no-repeat"
			});
			$("#step_3").css({
				opacity: 1
			});
			$("#step_3 legend").css({
				opacity: 1 // For dumb Internet Explorer
			});
		}
	};
*/
	
/*
	$("#step_2 input[name=company_name_toggle_group]").click(function(){
		$.stepTwoComplete_one = "complete"; 
		if ($("#company_name_toggle_on:checked").val() == 'on') {
			$("#company_name_wrap").slideDown();
		} else {
			$("#company_name_wrap").slideUp();
		};
		stepTwoTest();
	});
*/
	
/*
	$("#step_2 input[name=special_accommodations_toggle]").click(function(){
		$.stepTwoComplete_two = "complete"; 
		if ($("#special_accommodations_toggle_on:checked").val() == 'on') {
			$("#special_accommodations_wrap").slideDown();
		} else {
			$("#special_accommodations_wrap").slideUp();
		};
		stepTwoTest();
	});
*/
	
/*
	$("#rock").click(function(){
		if (this.checked && $("#num_attendees option:selected").text() != 'Please Choose'
		  	&& $.stepTwoComplete_one == 'complete' && $.stepTwoComplete_two == 'complete') {
				$("#submit_button").attr("disabled",false);
			} else {
				$("#submit_button").attr("disabled",true);
		}
	});
*/	
});