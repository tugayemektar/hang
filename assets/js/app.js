var record = {
        ms: 0,
        timer: 'recordTimer',
        textarea: '.record-area',
        button: '.record',
        notes: []
    },
    play = {
        button: '.play',
        timer: 0,
        duration: 0
    },
    note = {
        timer: 'noteTimer'
    }

function timer(int) {
    _int = parseInt(int) + 4;

    record['ms'] = _int;
    record['timer'] = window.setTimeout(function() { timer(_int) }, 1)
}

$(document).on('click', '.record', function() {
    $(play['button']).removeClass('playing');

    if ($(record['button']).hasClass('recording')) {
        $(record['button']).removeClass('recording')
        record['ms'] = 0;
        window.clearTimeout(record['timer'])
    } else {
        $(record['button']).addClass('recording')
        $(record['textarea']).val('');
        record['notes'] = [];

        timer(1)
    }

    return false;
}).on('click', '.open', function(e) {
    var $this = $(this),
        input = $('<input/>', { type: 'file', accept: '.hang' }),
        fileTypes = { 'extensions': [ 'hang' ], 'alert': 'Only (.hang) files!' };

    if ($this.data('extensions'))
        fileTypes['extensions'] = $this.data('extensions').split(',');
    if ($this.data('alert'))
        fileTypes['alert'] = $this.data('alert');

    input.click()
    input.on('change', function() {
        if (input[0].files && input[0].files[0]) {
            var extension = input[0].files[0].name.split('.').pop().toLowerCase();

            if (fileTypes['extensions'].indexOf(extension) > -1) {
                var filereader = new FileReader()
                    filereader.onload = function(e) {
                        $('.record-area').val(e.target.result)
                    }

                    filereader.readAsText(input[0].files[0])
            } else
                alert(fileTypes['alert'])
        }
    })

    return false;
}).on('click', '.save', function() {
    saveAs(
        new Blob(
            [$('.record-area').val()],
            { type: "text/plain;charset=utf-8" }
        ),
        $('.record-title').val() + ".hang"
    );

    return false;
}).on('click', '.play', function() {
    try {
        $value = $.parseJSON($(record['textarea']).val())
    }
    catch(e) {
        $(record['textarea']).val('Please first save the note.');

        return false;
    }

    var option = $('input[name=option]:checked').val();

    if ($(play['button']).hasClass('playing')) 
        return false;

    $(play['button']).addClass('playing')
    $(record['button']).removeClass('recording')

    window.clearTimeout(record['timer'])
    record['ms'] = 0;

    $.each($value, function(key, obj) {
        play['timer'] = window.setTimeout(function() {
            if ($(record['button']).hasClass('recording'))
                return false;

            _note($('.note[data-note=' + obj[0] + ']'));
        }, obj[1])
    })
}).on('click', '.note', function() {
    var option = $('input[name=option]:checked').val();

    if (option != 'click') return false;

    _note($(this));

    return false;
}).on('mouseenter', '.note', function() {
    var option = $('input[name=option]:checked').val();

    if (option != 'hover') return false;

    _note($(this));

    return false;
}).on('keydown', function(e) {
    $('.note').each(function() {
        var $this = $(this);

        if (e.keyCode == $this.data('key'))
            $this.click()
    })
})

function _note($this) {
    var $data = $this.data();

    $('.hang').removeClass('active')

    $this.addClass('active')
    $this.parent('.hang').addClass('active')

    var audioElement = document.createElement('audio');
        audioElement.setAttribute('src', 'assets/notes/' + $data.instrument + '/' + $data.note + '.mp3');
        audioElement.addEventListener("canplay", function() {
            window.clearTimeout(note['timer'])

            note['timer'] = window.setTimeout(function() {
                $(play['button']).removeClass('playing')
            }, parseInt(audioElement.duration) * 1000)
        })
        audioElement.play();

    setTimeout(function() {
        $this.removeClass('active')
    }, 100)

    if ($(record['button']).hasClass('recording')) {
        record['notes'].push([$data.note, record['ms']]);
        $(record['textarea']).val(record['notes'].toSource());
    }
}