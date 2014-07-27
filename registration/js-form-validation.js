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
	var preschool_tuition = 925;
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
	var numAttendees = 0;
	var numPreschool = 0;
	var numK8 = 0;
	var ontime_registration_deduction = 50;
	var assignment_book_total = 0; 
	var catechism_total = 0; 
	var bible_total = 0; 
	var hymnal_total = 0;
	var extracurricular_total = 0;
	var total = 0;
	var family = {
		"members": $("#members").val(),
		"additional_gift": 0,
		"k8tuition": 0,
		"pktuition": 0,
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
	
	$("#step_2, #step_3").css({ opacity: 0.3 });
	$.stepTwoComplete_one = "not complete";
	$.stepTwoComplete_two = "not complete"; 
	
/* 	family.members = $("#members").val(); */
/* 	family.students = []; */
	
	$("#members").change(function() {
		family.members = $("#members").val();
		recalculateTuition();
	});
	
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
		recalculateTuition();
		updateDisplay();
	});

	$("#add_students").click(function() {
		var all_complete = true;
		family.students = [];
		family.k8tuition = 0;
		family.pktuition = 0;
		numPreschool = 0;
		numK8 = 0;
		
		$(".active_name_field").each(function(index) {
			var i = index + 1;
			if ($(this).val() == '' ) {
				all_complete = false;
			} else {
				$("#attendee_legend_" + (i)).html($(this).val());
				var student = {
					"name": "",
					"grade": "x",
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
		});
		
		$(".grade_selector").each(function(index) {
			var i = index + 1;
			if ($(this).val() == 'x' ) {
				all_complete = false;
			} else { 
				family.students[index].grade = parseInt($(this).val());
				
				$("#assignment_book_" + i).attr("disabled",true);
				$("#catechism_book_" + i).attr("disabled",true);
				$("#bible_" + i).attr("disabled",true);
				$("#hymnal_" + i).attr("disabled",true);

				if (family.students[index].grade < 0) { 
					numPreschool++;
				} else {
					numK8++;
				}
				console.log("preschool: " + numPreschool);
				console.log("K8       : " + numK8);
				
				if (family.students[index].grade >= 3) {
					family.students[index].additional_fees.extra_curricular = 40; 
/* 					$("#breakdown_extra_curricular").html(formatCurrency(family.students[index].additional_fees.extra_curricular)); */
					$("#bible_" + i).attr("disabled",false);
					$("#hymnal_" + i).attr("disabled",false); 
					if (family.students[index].grade >= 5) { 
						$("#catechism_book_" + i).attr("disabled",false); 
					}
					if (family.students[index].grade <= 6) { 
						$("#assignment_book_" + i).attr("disabled",false); 
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
		recalculateTuition();
		calculateTotal();
		updateDisplay();
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
		updateDisplay();
	});
	
	$("#dump_button").click(function() {
		console.log(family);
	});
	
	$("#on_time_registration").click(function() {
		if (this.checked) {
			family.deductions.ontime_registration = ontime_registration_deduction * (numK8 + numPreschool);
		} else {
			family.deductions.ontime_registration = 0;
		}
		calculateTotal();
		updateDisplay();
	});
	
	$("#paid_in_full").click(function() {
		recalculateTuition();
		calculateTotal();
		updateDisplay();
	});
	
	$("#tuition_assistance").click(function(){
		if ($("#tuition_assistance:checked").val() == 'on') {
			$("#tuition_assistance_wrap").slideDown();
		} else {
			$("#tuition_assistance_wrap").slideUp();
			family.deductions.tuition_assistance = 0;
		};
		updateDisplay();
	});
	
	$(".tuition_assistance_amount").keyup(function() {
		family.deductions.tuition_assistance = parseInt($("#tuition_assistance_amount").val());
		updateDisplay();
	});
	
	$("#calculate_total").click(function() {
		calculateTotal();
		updateDisplay();
		$("#submit_button").attr("disabled",false);
	});
	
	function recalculateTuition() {
		console.log("numK8       : " + numK8);
		console.log("numPreschool: " + numPreschool);
		if (family.members == "yes") {
			family.k8tuition = (numK8 >= 2) ? 2 * member_tuition : numK8 * member_tuition;
		} else {
			family.k8tuition = (numK8 >= 3) ? 2.5 * nonmember_tuition : numK8 * nonmember_tuition;
		}
		
		family.pktuition = numPreschool * preschool_tuition;
		
		family.total_tuition = family.pktuition + family.k8tuition;
		
/*
		console.log("K8 tuition: " + family.k8tuition);
		console.log("PK tuition: " + family.pktuition);
		console.log("T  tuition: " + family.total_tuition);
*/
		
		family.required_fees.book_fee = numK8 * book_fee;
		family.required_fees.registration_fee = (numK8 + numPreschool) * registration_fee;
		family.required_fees.tech_fee = numK8 * tech_fee;

		if ($("#paid_in_full:checked").val() == 'on') { 
			family.deductions.paid_in_full = family.total_tuition * .05;
		} else {
			family.deductions.paid_in_full = 0;
		}
		calculateTotal();
		updateDisplay();
	};
	
	function calculateTotal() {
		var required_fees = family.k8tuition + family.pktuition + family.required_fees.registration_fee + family.required_fees.book_fee + family.required_fees.tech_fee + family.required_fees.pto_fee;
		var additional_fees = assignment_book_total + catechism_total + bible_total + hymnal_total + extracurricular_total;
		var deductions = family.deductions.ontime_registration + family.deductions.paid_in_full + family.deductions.tuition_assistance;
		console.log("required fees: " + required_fees);
		console.log("additional fees: " + additional_fees);
		console.log("deductions: " + deductions);
		total = required_fees + additional_fees - deductions;
		
		updateDisplay();
	}
	
	function updateDisplay() {
		$("#breakdown_registration_fee").html(formatCurrency(family.required_fees.registration_fee));
		$("#breakdown_k8tuition").html(formatCurrency(family.k8tuition));
		$("#breakdown_preschool_tuition").html(formatCurrency(family.pktuition));
		$("#breakdown_book_fee").html(formatCurrency(family.required_fees.book_fee));
		$("#breakdown_tech_fee").html(formatCurrency(family.required_fees.tech_fee));
		$("#breakdown_pto").html(formatCurrency(family.required_fees.pto_fee));
		
		$("#breakdown_paid_in_full").html(formatCurrency(family.deductions.paid_in_full));
		$("#breakdown_ontime_registration").html(formatCurrency(family.deductions.ontime_registration));
		$("#breakdown_tuition_assistance").html(formatCurrency(family.deductions.tuition_assistance));
		
		$("#breakdown_grand_total").html(formatCurrency(total));
	}
	
	function formatCurrency(input) {
		return "$" + input;
	}
});

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