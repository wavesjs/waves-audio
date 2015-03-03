

problèmes

`/utils/factory.js` is this the right way / place to put that logic

Engines

default context problem

having

// metronome
constructor(options = {}, audioContext = null) {
  super(audioContext);
}

cannot work, the transpiler transpile to `audioContext === undefined` to use the default parameter (null !== undefined)

@aside not the same logic between metronome and playerEngine for instance


then:

`super.audioContext` // doesn't work

should be 

`this.audioContext` event in a Child, only method are super.method();



