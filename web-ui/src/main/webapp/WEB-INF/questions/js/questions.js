$(function() {
    var pageTemplate;
    var currentUser;

    $.ajax({
        async: false,
        url: '/ui/questions/mst/questions_template.mst',
        type: "GET",
        success: function (data) {
            pageTemplate = data;
        }
    });

    function getQuestionFromForm() {
        var question = {};
        question.questionBody = $('#qBody').val();
        question.weight = $('#qWeight').find("input[name='score']").val();
        return question;
    };

    function sendQuestion(question) {
        if (!currentUser.questions) {
            currentUser.questions = [];
        }
        currentUser.questions[currentUser.questions.length] = question;
        var userInJson = JSON.stringify(currentUser);
        var success = true;
        $.ajax({
            url: '/users/',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            type: "PUT",
            data: userInJson,
            error: function (data, errorThrown, param3) {
                success = false;

                //TODO: replace with question specific error description
                $("#questionsErrContent").append('Failed to add/edit question. Error: ' + param3.name + ' ; ' + data.responseText);
                $("#dialog-form-error-question").dialog( "open" );
            }
        });
        return success;
    };

    function deleteQuestionsFromList(questionList, questionsToDelete) {
        // remove from current user questions that were selected for deletion
        $.each(questionsToDelete, function (index, questionToDelete) {
            $.each(questionList, function(index, question) {
                if (questionToDelete.weight == question.weight && questionToDelete.questionBody == question.questionBody) {
                    questionList.splice(index, 1);
                    return false;
                }
            });
        });
    }
    function deleteQuestions() {
        var selectedQuestions = getSelectedQuestions();
        if (!selectedQuestions.length) {
            return;
        }

        deleteQuestionsFromList(currentUser.questions, selectedQuestions);

        // serialize back the user with the new question set
        var userInJson = JSON.stringify(currentUser);
        var success = true;
        $.ajax({
            url: '/users/',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            type: "PUT",
            data: userInJson,
            error: function (data, errorThrown, param3) {
                success = false;
                $("#questionsErrContent").append('Failed to delete question(s). Error:'+ param3.name + ' ; ' + data.responseText);
                $("#dialog-form-error-question").dialog( "open" );
            }
        });
        return success;
    };

    $( "#dialog-form-error-question" ).dialog({
        modal: true,
        autoOpen: false,
        width: 'auto',
        resizable: false,
        dialogClass: 'dialog',
        close: function() {
            $("#questionErrContent").empty();
        }
    });

    $( "#dialog-form-delete-question" ).dialog({
        modal: true,
        autoOpen: false,
        width: 510,
        resizable: false,
        dialogClass: 'dialog'
    });

    $( "#dialog-form-add-question" ).dialog({
        modal: true,
        autoOpen: false,
        width: 'auto',
        resizable: false,
        dialogClass: 'dialog',
        open: function() {
            var question = $(this).data("question");
            if (question != null) {
                $('#qBody').val(question.questionBody);

                $('#qWeight').raty({
                    numberMax : 4,
                    hints: ['low', 'medium', 'high', 'very high'],
                    starOff : 'questions/images/star-off.png',
                    starOn  : 'questions/images/star-on.png',
                    score: question.weight
                });
            }
        },
        close: function(){
            $(".inputDLP").val('');
            $( "label.error").hide();
            $('#qWeight').raty({
                numberMax : 4,
                hints: ['low', 'medium', 'high', 'very high'],
                starOff : 'questions/images/star-off.png',
                starOn  : 'questions/images/star-on.png',
                score: 0
            });
        }
    });

    $( "#addQButton" ).click(function(e) {
        $( "#dialog-form-add-question" ).data( "question", null );
        $( "#dialog-form-add-question" ).dialog( "open" );
    });

    $( "#editQButton" ).click(function(e) {
        var questions = getSelectedQuestions();
        if (!questions.length) {
            return;
        }
        $( "#dialog-form-add-question" ).data( "question", questions[0]);
        $( "#dialog-form-add-question" ).dialog( "open" );
    });

    $( "#deleteQButton" ).click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $( "#dialog-form-delete-question" ).dialog( "open" );
    });

    $("#saveQButton").click( function(e){
        e.preventDefault();
        e.stopPropagation();

        if($("#questionForm").valid()){
            var questionToSend = getQuestionFromForm();
            if ($( "#dialog-form-add-question").data("question")) {
                deleteQuestionsFromList (currentUser.questions, [$( "#dialog-form-add-question").data("question")]);
            }
            sendQuestion(questionToSend);
            $( "#dialog-form-add-question" ).dialog( "close" );
            reloadPageContent();
        }
    });

    $( "#cancelQButton" ).click(function(e) {
        e.preventDefault();
        $( "#dialog-form-add-question" ).dialog( "close" );
    });

    $("#okDQButton").click( function(e){
        e.preventDefault();
        deleteQuestions();
        $( "#dialog-form-delete-question" ).dialog( "close" );
        reloadPageContent();
    });

    $( "#cancelDQButton" ).click(function(e) {
        e.preventDefault();
        $( "#dialog-form-delete-question" ).dialog( "close" );
    });

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function getSelectedQuestions () {
        var questions = [];
        var oTable = $('#selectableList').DataTable();

        var selectedItems;
        if (oTable.rows('.selected')) {
            selectedItems = oTable.rows('.selected').data();
            $.each (selectedItems, function (index, item) {
                questions [questions.length] = {
                    "questionBody": item[1],
                    "weight": item[2]
                };
            })
        }
        return questions;
    }

    $('#qWeight').raty({
        numberMax : 4,
        hints: ['low', 'medium', 'high', 'very high'],
        starOff : 'questions/images/star-off.png',
        starOn  : 'questions/images/star-on.png'
    });

    jQuery.fn.dataTableExt.oSort["starsort-desc"] = function (x, y) {
        return $(x).attr('name') - $(y).attr('name');
    };

    jQuery.fn.dataTableExt.oSort["starsort-asc"] = function (x, y) {
        return $(y).attr('name') - $(x).attr('name');
    }

    $("#questionForm").validate({
        rules: {
            questionBody: {
                required: true,
                minlength: 5
            }
        },
        messages: {
            questionBody: {
                required: "Question description is required.",
                minlength: jQuery.validator.format("At least {0} characters required in \"Question\" field.")
            }
        }
    });

    reloadPageContent();

    function reloadPageContent () {
        currentUser = {};

        $.ajax({
            async: false,
            url: '/users/' + getCookie('userId'),
            dataType: "json",
            type: "GET",
            success: function (user) {
                currentUser = user;
                currentUser.password = null;
                if (user.questions) {

                }
            }
        });

        var rendered = Mustache.render(pageTemplate, {"questions": currentUser.questions});
        $('#content').empty();
        $('#content').html(rendered);

        var table = $('#selectableList').DataTable({
            'iDisplayLength': 940,
            scrollY:        430,
            "columnDefs": [ {
                "targets": 2,
                "orderable": true,
                "data": null,
                "render": function ( data, type, full, meta ) {
                    var starsCount = full[2];
                    return '<div class="starRow" id="' + meta.row + '" name=' + starsCount + '></div>';
                }
            }],
            "aoColumns": [
                { "bSortable": false },
                { "bSortable": true },
                {
                    "bSortable": true,
                    "sType": "starsort"
                }
            ]
        });

        $('.starRow').raty({
            numberMax : 4,
            hints: ['low', 'medium', 'high', 'very high'],
            starOff : 'questions/images/star-off.png',
            starOn  : 'questions/images/star-on.png',
            readOnly: true,
            score: function() {
                return $(this).attr('name');
            }
        });

        $('#selectableList tbody').on( 'click', 'tr', function () {
            $(this).toggleClass('selected');
            /*var data = table.rows('.selected').data();
            var data0 = data[0][0];
            data0.('.check').checked = true;*/
        });

        $('#selectAll').click( function () {
            if(this.checked) {
                $('.check').each(function() {
                    this.checked = true;
                });
            }else{
                $('.check').each(function() {
                    this.checked = false;
                });
            }
        });
    }
});