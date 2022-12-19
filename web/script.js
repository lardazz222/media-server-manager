

// .cb on clicked
$('.cb').on("click", function() {
    // if has checked
    if ($(this).hasClass('checked')){
        // remove checked
        $(this).removeClass('checked');
    }
    // if not has checked
    else {
        // add checked
        $(this).addClass('checked');
    }
})


var holding = false;
var last_slider = null;
$(document).on("mousemove", function() {
    // if mouse is down
    if (event.buttons == 1 || holding) {
        holding = true;

        // get object clicked
        var object = $(event.target);
        // if object is slider-container
        if (last_slider != null){
            var slider = last_slider;
            last_slider = slider;
        }else{

            if (object.hasClass('slider-container')) {
                var slider = $(object)
            }else if (object.hasClass('slider-inner')) {
                var slider = $(object).parent();
            }else{
                return;
            }
        }
        // add active class to slider
        slider.addClass('active');
        // get the type, and range
        var type = slider.attr('type');
        var range = slider.attr('range');
        var min_range = range.split(',')[0];
        var max_range = range.split(',')[1];
        // convert to ints
        min_range = parseInt(min_range);
        max_range = parseInt(max_range);
        // get the slider
        var slider_inner = slider.find('.slider-inner');
        // get the percentage mouse clicked at
        var percentage = (event.pageX - slider.offset().left) / slider.width();
        percentage *= 100;
        // set the slider to the percentage
        // if type == float, set the value to the percentage, with the range
        if (type == 'float') {
            var value = (percentage / 100) * (max_range - min_range) + min_range;
            // round to 2 decimal places
            value = Math.round(value * 100) / 100;
            // clamp if the distance from max is .10 away
            if (value > max_range - .25) {
                value = max_range;
            }
            // clamp if the distance from min is .10 away
            if (value < min_range + .25) {
                value = min_range;
            }
            slider.attr('value', value);
        }else if (type == 'int') {
            var value = Math.round((percentage / 100) * (max_range - min_range) + min_range);
            // clamp if the distance from max is .10 away
            if (value > max_range - .25) {
                value = max_range;
            }
            // clamp if the distance from min is .10 away
            if (value < min_range + .25) {
                value = min_range;
            }

            slider.attr('value', value);
            // set the sub text
        }

        // get every child of slider and print the tag name
        slider.parent().find(".sub").text(slider.attr('value'));

        slider_inner.css('width', percentage + '%');

    }
})

// on mouse up
$(document).on("mouseup", function() {
    holding = false;
    last_slider = null;
    // remove active class from all sliders
    $('.slider-container').removeClass('active');
})


// combo box
// on combo box clicked, get the inner combo box and add the active class
$('.combo-box').on("click", function() {
    // if has active class remove it vise versa
    if ($(this).find('.combo-box-inner').hasClass('active')){
        $(this).find('.combo-box-inner').removeClass('active');
    }else{
        $(this).find('.combo-box-inner').addClass('active');
    }
})

// combo box item clicked
$('.combo-box-item').on("click", function() {
    // get the combo-box-container parent
    var combo_box = $(this).parent().parent();
    // text
    var text = $(this).parent().parent().find('.combo-box-text').find("span");
    // get the value of this item
    var value = $(this).attr('value');
    // set the text to the value
    text.text(value);
    // set the value of combo_box to value
    combo_box.attr('value', value);
})

// .side-panel on button click
$('.side-panel button').on("click", function() {
    // get target attr
    var target = $(this).attr('target');
    // remove active class from all content-panel
    $('.content-panel').removeClass('active');
    // add active class to target
    $("#" + target).addClass('active');
})


// increment control
// on increment control button
$('.increment-button').on("click", function() {
    // if text == + or -, do such operation
    var op = $(this).text().trim();
    var min = $(this).parent().parent().parent().attr('min');
    var max = $(this).parent().parent().parent().attr('max');
    var value = $(this).parent().parent().parent().attr('value');
    var step = $(this).parent().parent().parent().attr('step');

    // default if any are undefined
    if (min == "false" || min == undefined) {
        console.log(`The object: ${$(this).parent().parent().parent()} has no min attribute.`)
        min = false;
    }else{
        // parse
        min = parseInt(min);
    }
    if (max == undefined || max == "false") {
        max = false;
    }else{
        // parse
        max = parseInt(max);
    }
    if (value == undefined) {
        value = 0;
    }else{
        // parse
        value = parseInt(value);
    }
    if (step == undefined) {
        step = 1;
    }else{
        // parse
        step = parseInt(step);
    }


    // if min or max is false dont limit them
    if (op == "-"){
        if (min == false){
            value -= step;
        }else if (value - 1 >= min){
            value -= step;
        }
    }else{
        if (max == false){
            value += step;
        }else if (value + 1 <= max){
            value += step;
        }
    }

    // set the value
    $(this).parent().parent().parent().attr('value', value);
    // set the text
    $(this).parent().parent().find('.increment-text').text(value);



})

// on .control span first child hover
$('.control span:first-child').hover(function() {
    // ignore .control sliders
    if ($(this).parent().hasClass('slider-container')) {
        return;
    }
    // .control has a .sub child, add the active class
    $(this).parent().find('.sub').addClass('active');
    // add active to the first child
    $(this).addClass('active');
}, function() {
    // .control has a .sub child, remove the active class
    $(this).parent().find('.sub').removeClass('active');
    // remove active from the first child
    $(this).removeClass('active');
})