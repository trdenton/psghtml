

class Note {

    constructor(name_or_num) {
        if (typeof(name_or_num) === 'string') {
            this.name = name_or_num;
            this.num = this.mapNoteToNumber(name_or_num);
        } else {
            this.num = name_or_num;
            this.name = this.mapNoteToName(this.num);
        }
    }

    mapNoteToNumber(note) {
        var base_nums = {};
        base_nums["A"] = 21;
        base_nums["B"] = 23;
        base_nums["C"] = 12; // c0
        base_nums["D"] = 14;
        base_nums["E"] = 16;
        base_nums["F"] = 17;
        base_nums["G"] = 19;

        var num_sharps = (note.match(/#/g) || []).length;
        var num_flats = (note.match(/b/g) || []).length;

        var note_mod = num_sharps - num_flats;

        var base_note = note[0];
        note = note.replace(/[#b]/g,"");
        
        var octave = 4;
        if (note.length > 1) {
            octave = note[note.length-1];
        }
        return base_nums[base_note] + octave*12 + note_mod;
    }

    mapNoteToName(num) {
        var octave = Math.floor(num/12) - 1;
        var step = num % 12;
        var names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var base = names[step];
        return base + octave;
    }

    equalIgnoreOctave(other_note) {
        var num1 = this.num;
        var num2 = other_note.num;
        if ((num1 - num2)%12 == 0) {
            return true;
        }
        return false;
    }

    addHalfSteps(num) {
        return new Note(this.num + num);
    }

    getName() {
        return this.name;
    }
}

class PedalSteelGuitar {
    constructor() {
        this.num_frets = 25;
        this.notes = ["F#4","D#4","G#4","E4","B4","G#3","F#3","E3","D3","B3"];
        this.strings = [];
        this.pedals = [];
        this.actuated = {}

        // pedals
        this.pedals["A"] = [0, 0, 0, 0, 2, 0, 0, 0, 0, 2];
        this.pedals["B"] = [0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
        this.pedals["C"] = [0, 0, 0, 2, 2, 0, 0, 0, 0, 0];

        // levers
        this.pedals["D"] = [0,-1, 0, 0, 0, 0, 0, 0,-1, 0];
        this.pedals["E"] = [0, 0, 0,-1, 0, 0, 0,-1, 0, 0];
        this.pedals["F"] = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0];
        this.pedals["G"] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0];

        for(var i = 0; i < this.notes.length; i++) {
            var string = new Note(this.notes[i]);
            this.strings.push(string);
        }
    }
    
    pedalPush(index) {
        if (index in this.actuated) {
            return;
        }
        this.actuated[index] = true;
        var offsets = this.pedals[index];
        for(var i = 0; i < offsets.length; i++) {
            var note = this.strings[i];
            var note = note.addHalfSteps(offsets[i]);
            this.strings[i] = note;
        }
    }

    pedalRelease(index) {
        if (!(index in this.actuated)) {
            return;
        }
        delete this.actuated[index];
        var offsets = this.pedals[index];
        for(var i = 0; i < offsets.length; i++) {
            var note = this.strings[i];
            var note = note.addHalfSteps(-offsets[i]);
            this.strings[i] = note;
        }
    }

    getNoteAt(string_index, fret) {
        return this.strings[string_index].addHalfSteps(fret);
    }
}

class Chord {
    constructor(root, chord_type) {
        this.name = root + chord_type;
        this.note1 = new Note(root);
        this.note4 = 0;
        if (chord_type == "M") {
            this.note2 = this.note1.addHalfSteps(4);
            this.note3 = this.note2.addHalfSteps(3);
        }
        if (chord_type == "m") {
            this.note2 = this.note1.addHalfSteps(3);
            this.note3 = this.note2.addHalfSteps(4);
        }
        if (chord_type == "aug") {
            this.note2 = this.note1.addHalfSteps(4);
            this.note3 = this.note2.addHalfSteps(4);
        }
        if (chord_type == "dim") {
            this.note2 = this.note1.addHalfSteps(3);
            this.note3 = this.note2.addHalfSteps(3);
        }
        if (chord_type == "M7") {
            this.note2 = this.note1.addHalfSteps(4);
            this.note3 = this.note2.addHalfSteps(3);
            this.note4 = this.note3.addHalfSteps(4);
        }
        if (chord_type == "dom7") {
            this.note2 = this.note1.addHalfSteps(4);
            this.note3 = this.note2.addHalfSteps(3);
            this.note4 = this.note3.addHalfSteps(3);
        }
        if (chord_type == "m7") {
            this.note2 = this.note1.addHalfSteps(3);
            this.note3 = this.note2.addHalfSteps(4);
            this.note4 = this.note3.addHalfSteps(3);
        }
        if (chord_type == "dim7") {
            this.note2 = this.note1.addHalfSteps(3);
            this.note3 = this.note2.addHalfSteps(3);
            this.note4 = this.note3.addHalfSteps(3);
        }
    }

    is_seventh() {
        return this.note4 != 0;
    }

    contains(note) {
        if (this.note1.equalIgnoreOctave(note)) {
            return 1;
        }
        if (this.note2.equalIgnoreOctave(note)) {
            return 2;
        }
        if (this.note3.equalIgnoreOctave(note)) {
            return 3;
        }
        if (this.note4 != 0 && this.note4.equalIgnoreOctave(note)) {
            return 4;
        }
        return 0
    }
}

class SixStringGuitar extends PedalSteelGuitar {
    constructor() {
        super();
        this.num_frets = 25;
        this.notes = ["E","B","G","D","A","E"];
        this.strings = [];
        this.pedals = [];
        this.actuated = {}

        for(var i = 0; i < this.notes.length; i++) {
            var string = new Note(this.notes[i]);
            this.strings.push(string);
        }
    }
    pedalPush(index){}
    pedalRelease(index){}
}
