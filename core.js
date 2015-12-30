(function(){
  
  window.addEventListener('load', Init);
  
  function Init(){
    // return RunTests();
    
    
    
    
    
    // 5 bits for instruction 8 bits for data
    var instructions = [
       // ~((((((5 + 2 - 4) * 2 / 3 * 5 % 4) << 4) >> 1) + 5) & 27 | 46) ^ 78 == 142
       // Remember that the not is executed over 8 bits unsigned. So javascript will not
       // get the same answer as expected, but the CPU generates the right answer!!

       0b0001000000101,
       0b0001000000010,
       0b0001100000100,
       0b0010000000010,
       0b0010100000011,
       0b0010000000101,
       0b0011000000100,
       0b0100000000100,
       0b0100100000001,
       0b0001000000101,
       0b0101000011011,
       0b0101100101110,
       0b0110000000000,
       0b0110101001110,

       // Stores the current value into RAM address 10000000
       // And then loads it again

       0b0000110000000,
       0b0000010000000,

       // Jump over the end execution instruction

       0b0111000010010,
       0b1111100000000,

       // Add 5 (now value is 147)

       0b0001000000101,

       // Add 1 until == 155 (do while)
       // then jump to the final end execution line

       // add 1
       // compare to 155
       // if == 155 jump to line 23
       // jump to line 19

       0b0001000000001,
       0b0011110011011,
       0b1000000010111,
       0b0111000010011,

       0b1111100000000
     ];
   
    var instructions = [
      0b0001000000001,
      0b0011100010100,
      0b1000000000100,
      0b0111000000000,
      0b1111100000000
    ]
    
    
    
    
    
    var alwaysOn = new Wire();
    alwaysOn.on(window);
    
    var clockWire = new Wire();
    
    var control = new ControlUnit();
    control.CLOCK(clockWire);
    
    var dataBus = CreateBus(8);
    var instructionBus = CreateBus(5);
    
    
    
    
    
    
    
    var InstructionPointer = new Register(8);
    var TempInstructionPointer = new Register(8);
    var Incrementor = new IncrementUnit(8);
    
    InstructionPointer.INPUT.connect(dataBus);
    InstructionPointer.OUTPUT.connect(dataBus);
    
    TempInstructionPointer.INPUT.connect(dataBus);
    TempInstructionPointer.OUTPUT.connect(Incrementor.INPUT);
    
    Incrementor.OUTPUT.connect(dataBus);
    
    control.SETIP(InstructionPointer.SET);
    control.ENABLEIP(InstructionPointer.ENABLE);
    
    control.SETINCR(TempInstructionPointer.SET);
    control.ENABLEINCR(Incrementor.ENABLE);
    
    TempInstructionPointer.ENABLE(alwaysOn);
    
    
    
    
    
    
    
    var ram = new RAM(13, instructions);
    var MemoryAddress = new Register(8);
    
    ram.INPUT.connect(MemoryAddress.OUTPUT, CreateBus(5));
    ram.OUTPUT.connect(dataBus, instructionBus);
    
    MemoryAddress.INPUT.connect(dataBus);
    MemoryAddress.ENABLE(alwaysOn);
    
    control.SETMEM(MemoryAddress.SET);
    
    control.SETRAM(ram.SET);
    control.ENABLERAM(ram.ENABLE);
    
    
    
    
    
    
    var Instruction = new Register(5);
    
    Instruction.INPUT.connect(instructionBus);
    Instruction.OUTPUT.connect(control.INST);
    
    Instruction.SET(control.SETINST);
    Instruction.ENABLE(alwaysOn);
    
    
    
    
    
    
    
    var TempRegister = new Register(8);
    
    TempRegister.INPUT.connect(dataBus);
    TempRegister.ENABLE(alwaysOn);
    
    control.SETTMP(TempRegister.SET);
    
    
    
    
    
    var Accumulator = new Register(8);
    
    Accumulator.INPUT.connect(dataBus);
    Accumulator.ENABLE(alwaysOn);
    
    control.SETACC(Accumulator.SET);
    
    
    
    
    
    
    
    var FlagsRegister = new Register(6);
    
    FlagsRegister.ENABLE(alwaysOn);
    
    control.ALUFLAGS.connect(FlagsRegister.OUTPUT);
    control.SETFLAGS(FlagsRegister.SET);
    
    
    var ALU = new ArithmeticLogicUnit(8);
    
    ALU.A.connect(TempRegister.OUTPUT);
    ALU.B.connect(Accumulator.OUTPUT);
    ALU.FLAGS.connect(FlagsRegister.INPUT);
    
    control.ALUCTL.connect(ALU.CTL);
    
    
    




    var TempALUOutput = new Register(8);

    TempALUOutput.INPUT.connect(ALU.OUTPUT);
    TempALUOutput.OUTPUT.connect(dataBus);

    control.ALUTEMPSET(TempALUOutput.SET);
    control.ALUTEMPENABLE(TempALUOutput.ENABLE);


    
    
    
    
    
    
    function REPR(){
      console.log('IP      ~', InstructionPointer.repr());
      console.log('TMP IP  ~', TempInstructionPointer.repr());
      console.log('MEM AD  ~', MemoryAddress.repr());
      console.log('INST    ~', Instruction.repr());
      console.log('RAM     ~', ram.repr());
      console.log('TMP ALU ~', TempRegister.repr());
      console.log('ACCUM   ~', Accumulator.repr());
      console.log('FLAGS   ~', FlagsRegister.repr());
      console.log('ALU     ~', ALU.repr());
      console.log('ALU OUT ~', TempALUOutput.repr());
      console.log('INCR    ~', Incrementor.repr());
    }
    window.REPR = REPR;
    
    
    
    
    
    
    function Clock(){
      if(clockWire.status()) clockWire.off(window);
      else clockWire.on(window);
    }
    window.setInterval(Clock, 5);
    
  }
  function RunTests(){
    TestBus();
    console.log('---------');
    TestIncrementUnit();
    console.log('---------');
    TestRegister();
    console.log('---------');
    TestRAM();
    console.log('---------');
    TestArithmeticLogicUnit();
  }
  
})();



var display = new SerialDisplay();
display.onUpdate = function(value){
  document.querySelector('.SerialDisplay').innerHTML = value.replace(/\n/g, '\<br/>');
}

var wset = new Wire();
var wclear = new Wire();

var pins = new PinGroup(window);
var inputConnector = new PinConnector([
  pins.init('IN0', new Function()),
  pins.init('IN1', new Function()),
  pins.init('IN2', new Function()),
  pins.init('IN3', new Function()),
  pins.init('IN4', new Function()),
  pins.init('IN5', new Function()),
  pins.init('IN6', new Function()),
  pins.init('IN7', new Function())
]);
var input = new BinaryPinGroup(pins, ['IN0', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7']);

display.SET(wset);
display.CLEAR(wclear);
display.INPUT.connect(inputConnector);

input.write(4);
wset.on(window);
wset.off(window);

input.write(0);
wset.on(window);
wset.off(window);

input.write(50);
wset.on(window);
wset.off(window);




function SerialDisplay(){
  var self = this;
  var undefined;
  
  
  var pins = new PinGroup(self);
  var input;
  
  var value = '';
  const charCodes = [
    '\n',
    ' ',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '-',
    '_',
    '=',
    '+',
    '[',
    ']',
    '|',
    '{',
    '}',
    '\\',
    ':',
    ';',
    '\'',
    '"',
    '<',
    ',',
    '>',
    '.',
    '?',
    '/',
    '~',
    '`'
  ];
  
  
  self.CLEAR = pins.init('CLEAR', Update);
  self.SET = pins.init('SET', Update);
  
  self.onUpdate = new Function();
  
  
  function GetValue(){
    return value;
  }
  
  
  function Update(){
    if(pins.read('CLEAR'))
      value = '';
    else if(pins.read('SET'))
      DoSet();
    self.onUpdate(value);
  }
  function DoSet(){
    var inputValue = input.read();
    var char = charCodes[inputValue];
    if (char === undefined) return;
    value += char;
  }
  
  
  (function Constructor(){
    var refBitSize = 8;
    
    input = [];
    var inputConnector = [];

    for(var i=0; i<refBitSize; i++){
      self['IN'+i] = pins.init('IN'+i, Update);
      inputConnector.push(self['IN'+i]);
      input.push('IN'+i);
    }
    
    input = new BinaryPinGroup(pins, input);
    self.INPUT = new PinConnector(inputConnector);
  }).apply(self, arguments);
}



function ControlUnit(){
  var self = this;
  var undefined;
  
  
  var pins = new PinGroup(self);
  var instruction;
  var alucontrol;
  
  var catalog = {
    Load: [
      DoLoad,
      SetMemAddressToTemp,
      SetAccumulatorToMemAddress,
      CloseSetAccumulatorToMemAddress
    ],
    Store: [
      DoStore,
      SetMemAddressToTemp,
      LoadAccumulatorIntoRam,
      CloseStorage
    ],
    Add: [
      SetAddOperator
    ],
    Sub: [
      SetSubOperator
    ],
    Mul: [
      SetMulOperator
    ],
    Div: [
      SetDivOperator
    ],
    Mod: [
      SetModOperator
    ],
    CMP: [
      SetCMPOperator
    ],
    LShift: [
      SetLShiftOperator
    ],
    RShift: [
      SetRShiftOperator
    ],
    And: [
      SetAndOperator
    ],
    Or: [
      SetOrOperator
    ],
    Not: [
      SetNotOperator
    ],
    Xor: [
      SetXorOperator
    ],
    Jump: [
      SetInstructionPointerToTemp,
      DoCloseTempStorage,
      JumpToNextInstruction
    ],
    JumpGT: [
      DoJumpGT
    ],
    JumpEQ: [
      DoJumpEQ
    ],
    JumpLT: [
      DoJumpLT
    ],
    End: [
      DoEndExecution
    ]
  };
  var microPrograms = {
    IncrementInstructionPointer: [
      SetTempInstructionPointer,
      IncrementSetInstructionPointer,
      CloseIncrementInstructionPointer
    ],
    LoadInstruction: [
      SetMemAddress,
      SetInstruction,
      CloseSetInstruction
    ],
    ExecuteALU: [
      SaveALUResultToRegister,
      MoveALURegisterToAccumulator,
      CloseAccumulatorALUSet
    ],
    ExecuteInstruction: [
      InterpretInstruction
    ]
  };
  
  var executionStack = [];
  JumpToNextInstruction();
  
  function SetupPins(){
    self.CLOCK = pins.init('CLOCK', OnClock);
    
    self.SETMEM = pins.init('SETMEM', Update);
    
    self.SETRAM = pins.init('SETRAM', Update);
    self.ENABLERAM = pins.init('ENABLERAM', Update);
    
    self.SETINST = pins.init('SETINST', Update);
    
    self.SETIP = pins.init('SETIP', Update);
    self.ENABLEIP = pins.init('ENABLEIP', Update);
    self.SETINCR = pins.init('SETINCR', Update);
    self.ENABLEINCR = pins.init('ENABLEINCR', Update);
    
    self.SETFLAGS = pins.init('SETFLAGS', Update);
    
    self.ALUCTL0 = pins.init('ALUCTL0', Update);
    self.ALUCTL1 = pins.init('ALUCTL1', Update);
    self.ALUCTL2 = pins.init('ALUCTL2', Update);
    self.ALUCTL3 = pins.init('ALUCTL3', Update);
    self.ALUCTL  = new PinConnector([
      self.ALUCTL0,
      self.ALUCTL1,
      self.ALUCTL2,
      self.ALUCTL3
    ]);
    alucontrol = new BinaryPinGroup(pins, [
      'ALUCTL0',
      'ALUCTL1',
      'ALUCTL2',
      'ALUCTL3'
    ]);
    
    self.ALUTEMPSET = pins.init('ALUTEMPSET', Update);
    self.ALUTEMPENABLE = pins.init('ALUTEMPENABLE', Update);
    
    self.ALUFLAG0 = pins.init('ALUFLAG0', Update);
    self.ALUFLAG1 = pins.init('ALUFLAG1', Update);
    self.ALUFLAG2 = pins.init('ALUFLAG2', Update);
    self.ALUFLAG3 = pins.init('ALUFLAG3', Update);
    self.ALUFLAG4 = pins.init('ALUFLAG4', Update);
    self.ALUFLAG5 = pins.init('ALUFLAG5', Update);
    self.ALUFLAGS = new PinConnector([
      self.ALUFLAG0,
      self.ALUFLAG1,
      self.ALUFLAG2,
      self.ALUFLAG3,
      self.ALUFLAG4,
      self.ALUFLAG5
    ]);
        
    self.SETTMP = pins.init('SETTMP', Update);
    self.SETACC = pins.init('SETACC', Update);
    
    self.INST0 = pins.init('INST0', Update);
    self.INST1 = pins.init('INST1', Update);
    self.INST2 = pins.init('INST2', Update);
    self.INST3 = pins.init('INST3', Update);
    self.INST4 = pins.init('INST4', Update);
    self.INST  = new PinConnector([
      self.INST0,
      self.INST1,
      self.INST2,
      self.INST3,
      self.INST4
    ]);
    instruction = new BinaryPinGroup(pins, [
      'INST0',
      'INST1',
      'INST2',
      'INST3',
      'INST4'
    ]);
    
    alucontrol = new BinaryPinGroup(pins, ['ALUCTL0', 'ALUCTL1', 'ALUCTL2', 'ALUCTL3']);
    instruction = new BinaryPinGroup(pins, ['INST0', 'INST1', 'INST2', 'INST3', 'INST4']);
  }
  
  
  function Update(){}
  
  function OnClock(){
    var currentBlock = executionStack.shift();
    if (currentBlock !== undefined)
      currentBlock();
  }
  function IncrementToNextInstruction(){
    executionStack = executionStack.concat(microPrograms.IncrementInstructionPointer).concat(microPrograms.LoadInstruction).concat(microPrograms.ExecuteInstruction);
  }
  function JumpToNextInstruction(){
    executionStack = executionStack.concat(microPrograms.LoadInstruction).concat(microPrograms.ExecuteInstruction);
  }
  function ExecuteALUOperation(){
    executionStack = executionStack.concat(microPrograms.ExecuteALU);
    OnClock();
  }
  
  
  
  // Micro Program to Increment Instruction Pointer
  function SetTempInstructionPointer(){
    console.group('Increment Instruction Pointer');
    console.info('Set temporary instruction pointer');
    
    pins.write('ENABLEIP', 1);
    pins.write('SETINCR', 1);
  }
  function IncrementSetInstructionPointer(){
    console.info('Set instruction pointer to incremented value');
    
    pins.write('SETINCR', 0);
    pins.write('ENABLEIP', 0);
    pins.write('ENABLEINCR', 1);
    pins.write('SETIP', 1);
  }
  function CloseIncrementInstructionPointer(){
    console.info('Close instruction pointer incrementation connections');
    console.groupEnd();
    
    pins.write('SETIP', 0);
    pins.write('ENABLEINCR', 0);
  }
  
  // Micro Program to load current instruction using address in instruction pointer register
  function SetMemAddress(){
    console.group('Load Current Instruction');
    console.info('Set memory address register to instruction pointer');
    
    pins.write('ENABLEIP', 1);
    pins.write('SETMEM', 1);
  }
  function SetInstruction(){
    console.info('Load next instruction from ram (sets ALU temp register with data and instruction register)');
    
    pins.write('SETMEM', 0);
    pins.write('ENABLEIP', 0);
    pins.write('ENABLERAM', 1);
    pins.write('SETINST', 1);
    pins.write('SETTMP', 1);
  }
  function CloseSetInstruction(){
    console.info('Close instruction feed from RAM (already in register)');
    console.groupEnd();
    
    pins.write('SETTMP', 0);
    pins.write('SETINST', 0);
    pins.write('ENABLERAM', 0);
  }
  
  // Micro Program to execute ALU and save result in accumulator and save flags
  function SaveALUResultToRegister(){
    console.group('Execute ALU');
    console.info('Moving ALU result to temporary ALU output register (also saving flags to flags register)');
    
    pins.write('ALUTEMPSET', 1);
    pins.write('SETFLAGS', 1);
  }
  function MoveALURegisterToAccumulator(){
    console.info('Moving temporary ALU output register data to accumulator');
    
    pins.write('SETFLAGS', 0);
    pins.write('ALUTEMPSET', 0);
    pins.write('ALUTEMPENABLE', 1);
    pins.write('SETACC', 1);
  }
  function CloseAccumulatorALUSet(){
    console.info('Closing closing transaction to accumulator from ALU temp output');
    console.groupEnd();
    
    pins.write('SETACC', 0);
    pins.write('ALUTEMPENABLE', 0);
  }
  
  // Micro Program to interpret the current instruction
  function InterpretInstruction(){
    var action;
    
    switch(instruction.read()){
      case 0:  action = catalog.Load; break;
      case 1:  action = catalog.Store; break;
      case 2:  action = catalog.Add; break;
      case 3:  action = catalog.Sub; break;
      case 4:  action = catalog.Mul; break;
      case 5:  action = catalog.Div; break;
      case 6:  action = catalog.Mod; break;
      case 7:  action = catalog.CMP; break;
      case 8:  action = catalog.LShift; break;
      case 9:  action = catalog.RShift; break;
      case 10: action = catalog.And; break;
      case 11: action = catalog.Or; break;
      case 12: action = catalog.Not; break;
      case 13: action = catalog.Xor; break;
      case 14: action = catalog.Jump; break;
      case 15: action = catalog.JumpGT; break;
      case 16: action = catalog.JumpEQ; break;
      case 17: action = catalog.JumpLT; break;
      case 31: action = catalog.End; break;
      default: action = [];
    }
    
    executionStack = executionStack.concat(action);
    OnClock();
  }
  
  // LOAD command
  function DoLoad(){
    console.group('cmd: LOAD');
    OnClock();
  }
  function SetMemAddressToTemp(){
    console.info('Moving temp register to Memory Address register');
    
    // feed temp through (data from current instruction)
    alucontrol.write(13);
    pins.write('ALUTEMPENABLE', 1);
    pins.write('ALUTEMPSET', 1);
    pins.write('SETMEM', 1);
  }
  function SetAccumulatorToMemAddress(){
    console.info('Set accumulator to memory at the memory address register');
    
    pins.write('SETMEM', 0);
    pins.write('ALUTEMPSET', 0);
    pins.write('ALUTEMPENABLE', 0);
    pins.write('ENABLERAM', 1);
    pins.write('SETACC', 1);
  }
  function CloseSetAccumulatorToMemAddress(){
    console.info('Close data feed from RAM');
    console.groupEnd();

    pins.write('SETACC', 0);
    pins.write('ENABLERAM', 0);
    
    
    IncrementToNextInstruction();
  }
  
  // STORE command
  function DoStore(){
    console.group('cmd: STORE');
    OnClock();
  }
  function LoadAccumulatorIntoRam(){
    console.info('Moving accumulator value onto the bus and setting RAM');
    
    pins.write('SETMEM', 0);
    
    // feed accumulator through
    alucontrol.write(12);
    
    pins.write('SETRAM', 1);
  }
  function CloseStorage(){
    console.info('Closing storage -> Removing accumulator from bus and set flag on RAM');
    console.groupEnd();
    
    pins.write('SETRAM', 0);
    pins.write('ALUTEMPSET', 0);
    pins.write('ALUTEMPENABLE', 0);
    
    IncrementToNextInstruction();
  }
  
  // ADD command
  function SetAddOperator(){
    console.group('cmd: ADD');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(0);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // SUB command
  function SetSubOperator(){
    console.group('cmd: SUB');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(1);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // MUL command
  function SetMulOperator(){
    console.group('cmd: MUL');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(2);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // DIV command
  function SetDivOperator(){
    console.group('cmd: DIV');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(3);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // MOD command
  function SetModOperator(){
    console.group('cmd: MOD');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(4);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // CMP command
  function SetCMPOperator(){
    console.group('cmd: CMP');
    console.info('Update ALU flags using new ALU input without changing the accumulator');
    console.groupEnd();
    
    alucontrol.write(5);
    pins.write('SETFLAGS', 1);
    pins.write('SETFLAGS', 0);

    IncrementToNextInstruction();
  }
  
  // LShift command
  function SetLShiftOperator(){
    console.group('cmd: LSHIFT');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(6);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // RShift command
  function SetRShiftOperator(){
    console.group('cmd: RSHIFT');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(7);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // AND command
  function SetAndOperator(){
    console.group('cmd: AND');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(8);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // OR command
  function SetOrOperator(){
    console.group('cmd: OR');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(9);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // NOT command
  function SetNotOperator(){
    console.group('cmd: NOT');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(10);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // XOR command
  function SetXorOperator(){
    console.group('cmd: XOR');
    console.info('Set ALU operator');
    console.groupEnd();
    
    alucontrol.write(11);
    
    ExecuteALUOperation();
    IncrementToNextInstruction();
  }
  
  // Jump Command
  function SetInstructionPointerToTemp(){
    console.group('cmd: JUMP');
    console.info('Moving temp register to instruction pointer register');
    
    // feed temp through (data from current instruction)
    alucontrol.write(13);
    pins.write('ALUTEMPENABLE', 1);
    pins.write('ALUTEMPSET', 1);
    pins.write('SETIP', 1);
  }
  function DoCloseTempStorage(){
    console.info('Closing move to instruction pointer register');
    console.groupEnd();
    
    pins.write('SETIP', 0);
    pins.write('ALUTEMPSET', 0);
    pins.write('ALUTEMPENABLE', 0);
  }
  
  // DoJumpGT
  function DoJumpGT(){
    console.group('cmd: JumpGT');
    console.info('If comparison flags show A > B then execute jump command');
    console.groupEnd();
    
    if (pins.read('ALUFLAG5')){
      executionStack = executionStack.concat(catalog.Jump);
      OnClock();
    }else{
      IncrementToNextInstruction();
    }
  }
  
  // DoJumpEQ
  function DoJumpEQ(){
    console.group('cmd: JumpEQ');
    console.info('If comparison flags show A == B then execute jump command');
    console.groupEnd();
    
    if (pins.read('ALUFLAG4')){
      executionStack = executionStack.concat(catalog.Jump);
      OnClock();
    }else{
      IncrementToNextInstruction();
    }
  }
  
  // DoJumpLT
  function DoJumpLT(){
    console.group('cmd: JumpLT');
    console.info('If comparison flags show A < B then execute jump command');
    console.groupEnd();
    
    if (! pins.read('ALUFLAG5') && ! pins.read('ALUFLAG4')){
      executionStack = executionStack.concat(catalog.Jump);
      OnClock();
    }else{
      IncrementToNextInstruction();
    }
  }
  
  // END Command
  function DoEndExecution(){
    console.group('cmd: END');
    console.info('Ending execution');
    console.groupEnd();
  }
  
  
  (function Constructor(){
    SetupPins();
  }).apply(self, arguments);
}

function CreateBus(width){
  var wires = [];
  for(var i=0; i<width; i++)
    wires.push(new Wire);
  return new PinConnector(wires);
}
function TestBus(){
  var reg1 = new Register(4);
  var reg2 = new Register(4);
  var reg3 = new Register(4);
  
  var bus = CreateBus(4);
  
  reg1.INPUT.connect(bus);
  reg2.INPUT.connect(bus);
  reg3.OUTPUT.connect(bus);
  
  var alwaysOn = new Wire();
  alwaysOn.on(window);
  
  reg3.IN2(alwaysOn);
  reg3.SET(alwaysOn);
  reg3.ENABLE(alwaysOn);
  
  console.log('reg1', reg1.repr());
  console.log('reg2', reg2.repr());
  console.log('reg3', reg3.repr());
}

function PinGroup(){
  var self = this;
  var undefined;
  
  
  var pins = {}
  var device;
  
  
  self.write = Write;
  self.read = Read;
  self.init = Init;
  
  self.list = List;
  self.repr = Repr;
  self.print = Print;
  
  
  function Write(label, value){
    if(label === undefined) throw 'PinGroup Write requires label';
    value = parseInt(value);
    
    ThrowExists(label);
    var old = pins[label].status();
    
    if (value > 0) pins[label].on(device);
    else pins[label].off(device);
    
    return old;
  }
  function Read(label){
    if(label === undefined) throw 'PinGroup Read requires label';
    
    ThrowExists(label);
    return pins[label].status();
  }
  function Init(label, listener){
    if(listener === undefined) throw 'PinGroup Init requires listener';
    if(label === undefined) throw 'PinGroup Init requires label';
    
    pins[label] = new Wire();
  
    return function SetPin(obj){
      if(obj instanceof Wire) return ConnectWire(obj);
      else if(typeof obj === 'function') return ConnectPin(obj);
      throw 'Unknown obj tried to connected to pin';
    }
    
    function ConnectWire(wire){
      var oldWire = pins[label];
      
      pins[label].unlisten(listener);
      pins[label] = wire;
      pins[label].listen(listener);
      
      if(oldWire.status() != wire.status())
        listener();
    }
    function ConnectPin(pin){
      var wire = new Wire();
      pin(wire);
      ConnectWire(wire);
    }
  }
  
  function List(){
    var list = [];
    
    for(var pin in pins)
      list.push(pin);
    
    return list;
  }
  function Repr(){
    var output = [];
    
    for(var pin in pins){
      var value = pins[pin].status();
      output.push('PIN '+pin+' = '+value);
    }
    
    output.sort();
    return output.join('\n');
  }
  function Print(){
    console.groupCollapsed('PIN Group');
    
    var lines = Repr().split('\n');
    for(var i=0; i<lines.length; i++){
      var line = lines[i];
      console.log(line);
    }
    
    console.groupEnd();
  }
  
  
  function ThrowExists(label){
    if(Exists(label)) return true;
    throw 'PIN \''+label+'\' does not exists on device.';
  }
  function Exists(label){
    return pins[label] !== undefined;
  }
  
  
  (function Constructor(_device){
    if(_device === undefined)
      throw 'Device required for PinGroup initialization.';
    device = _device;
  }).apply(self, arguments);
}
function BinaryPinGroup(){
  var self = this;
  var undefined;
  
  
  var pinGroup;
  var pins;
  
  
  self.pins = Pins;
  
  self.read = Read;
  self.write = Write;
  
  
  function Pins(){
    return pins;
  }
  function Read(){
    var groupValue = 0;
    
    for(var i=0; i<pins.length; i++){
      var pin = pins[i];
      var pinValue = pinGroup.read(pin);
      groupValue |= pinValue << i;
    }
    
    return groupValue;
  }
  // returns bool (true if overflow)
  function Write(value){
    if (value === undefined || typeof value != 'number' || value % 1 != 0 || value < 0)
      throw 'BinaryPinGroup Write method requires a positive integer value';
    
    for(var i=0; i<pins.length; i++){
      var pin = pins[i];
      var pinValue = value & (1 << i);
      pinGroup.write(pin, pinValue);
    }
    
    return value >= (1 << pins.length);
  }
  
  
  (function Constructor(_pinGroup, _pins){
    if(_pinGroup === undefined)
      throw 'PinGroup required for BinaryPinGroup initialization.';
    if(_pins === undefined)
      throw 'Pins Array required for BinaryPinGroup initialization.';
    
    pinGroup = _pinGroup;
    pins = _pins;
  }).apply(self, arguments);
}
function PinConnector(){
  var self = this;
  var undefined;
  
  
  var pins;
  
  
  self.connect = Connect;
  self.size = Size;
  self.pins = Pins;
  
  
  function Connect(){
    var connectors = arguments;
    
    var pinsum = 0;
    for(var i=0; i<connectors.length; i++){
      var connector = connectors[i];
      if (! (connector instanceof PinConnector))
        throw 'PinConnector can only connect to other PinConnector instances';
      pinsum += connector.size();
    }
    
    if (pinsum != pins.length)
      throw 'PinConnector cannot connect. Too many or too few pins provided';
    
    var pinIndex = 0;
    for(var i=0; i<connectors.length; i++){
      var connector = connectors[i];
      var connectorPins = connector.pins();
      for(var j=0; j<connectorPins.length; j++){
        var connectorPin = connectorPins[j];
        var pin = pins[pinIndex++];
        pin(connectorPin);
      }
    }
  }
  function Size(){
    return pins.length;
  }
  function Pins(){
    return pins.concat([]);
  }
  
  
  (function Constructor(_pins){
    if(_pins === undefined)
      throw 'PinConnector requires pins to initialize';
    
    pins = _pins;
  }).apply(self, arguments);
}

function IncrementUnit(){
  var self = this;
  var undefined;
  
  
  var pins = new PinGroup(self);
  var inputGroup;
  var outputGroup;
  
  
  self.ENABLE = pins.init('ENABLE', Update);
  
  self.repr = Repr;
  
  
  function Repr(){
    var input = inputGroup.read();
    var output = outputGroup.read();
    return 'IncrementUnit(in: '+input+'; out: '+output+'; enabled: '+pins.read('ENABLE')+')';
  }
  
  
  function Update(){
    if(pins.read('ENABLE'))
      outputGroup.write(inputGroup.read() + 1);
    else
      outputGroup.write(0);
  }
  
  
  (function Constructor(refBitSize){
    if(refBitSize === undefined)
      throw 'refBitSize required for IncrementUnit initialization';
    
    inputGroup = [];
    outputGroup = [];
    
    var inputConnector = [];
    var outputConnector = [];
    
    for(var i=0; i<refBitSize; i++){
      self['IN'+i] = pins.init('IN'+i, Update);
      self['OUT'+i] = pins.init('OUT'+i, Update);
      inputConnector.push(self['IN'+i]);
      outputConnector.push(self['OUT'+i]);
      inputGroup.push('IN'+i);
      outputGroup.push('OUT'+i);
    }
    
    inputGroup = new BinaryPinGroup(pins, inputGroup);
    outputGroup = new BinaryPinGroup(pins, outputGroup);
    
    self.INPUT = new PinConnector(inputConnector);
    self.OUTPUT = new PinConnector(outputConnector);
  }).apply(self, arguments);
}
function TestIncrementUnit(){
  var inc = new IncrementUnit(4);
  
  var in0 = new Wire();
  var in1 = new Wire();
  var in2 = new Wire();
  var in3 = new Wire();
  
  var out0 = new Wire();
  var out1 = new Wire();
  var out2 = new Wire();
  var out3 = new Wire();
  
  var wenable = new Wire();
  wenable.on(window);
  
  var input = new PinConnector([in0, in1, in2, in3]);
  var output = new PinConnector([out0, out1, out2, out3]);
  
  inc.INPUT.connect(input);
  inc.OUTPUT.connect(output);
  
  inc.ENABLE(wenable);
  
  console.log(inc.repr());
  
  in0.on(window);
  in3.on(window);
  
  console.log(inc.repr());
  
  in1.on(window);
  in2.on(window);
  
  console.log(inc.repr());
}

function Register(){
  var self = this;
  var undefined;
  
  
  var savedValue = 0;
  
  var pins = new PinGroup(self);
  var inputGroup;
  var outputGroup;
  
  
  self.SET = pins.init('SET', Update);
  self.ENABLE = pins.init('ENABLE', Update);
  
  self.repr = Repr;
  
  
  function Repr(){
    var input = inputGroup.read();
    var output = outputGroup.read();
    var saved = savedValue;
    return 'Register(in: '+input+'; out: '+output+'; saved: '+saved+'; enabled: '+pins.read('ENABLE')+')';
  }
  
  
  function Update(){
    if(pins.read('SET'))
      DoSetValue();
    if(pins.read('ENABLE'))
      DoEnableValue();
    else
      DoClearValue();
  }
  function DoSetValue(){
    savedValue = inputGroup.read();
  }
  function DoEnableValue(){
    outputGroup.write(savedValue);
  }
  function DoClearValue(){
    outputGroup.write(0);
  }
  
  
  (function Constructor(refBitSize){
    if(refBitSize === undefined)
      throw 'refBitSize required for Register initialization';
    
    inputGroup = [];
    outputGroup = [];
    
    var inputConnector = [];
    var outputConnector = [];
    
    for(var i=0; i<refBitSize; i++){
      self['IN'+i] = pins.init('IN'+i, Update);
      self['OUT'+i] = pins.init('OUT'+i, Update);
      inputConnector.push(self['IN'+i]);
      outputConnector.push(self['OUT'+i]);
      inputGroup.push('IN'+i);
      outputGroup.push('OUT'+i);
    }
    
    inputGroup = new BinaryPinGroup(pins, inputGroup);
    outputGroup = new BinaryPinGroup(pins, outputGroup);
    
    self.INPUT = new PinConnector(inputConnector);
    self.OUTPUT = new PinConnector(outputConnector);
  }).apply(self, arguments);
}
function TestRegister(){
  var register = new Register(4);
  
  var in0 = new Wire();
  var in1 = new Wire();
  var in2 = new Wire();
  var in3 = new Wire();
  
  var out0 = new Wire();
  var out1 = new Wire();
  var out2 = new Wire();
  var out3 = new Wire();
  
  var wset = new Wire();
  var wenable = new Wire();
  
  var input = new PinConnector([in0, in1, in2, in3]);
  var output = new PinConnector([out0, out1, out2, out3]);
  
  register.INPUT.connect(input);
  register.OUTPUT.connect(output);
  
  register.SET(wset);
  register.ENABLE(wenable);
  
  // in: 0000; out: 0000; saved: 0000
  console.log(register.repr());
  
  in0.on(window);
  in2.on(window);
  
  // in: 1010; out: 0000; saved: 0000
  console.log(register.repr());
  
  wenable.on(window);
  
  // in: 1010; out: 0000; saved: 0000
  console.log(register.repr());
  
  wset.on(window);
  
  // in: 1010; out: 1010; saved: 1010
  console.log(register.repr());
  
  wset.off(window);
  in0.off(window);
  in3.on(window);
  
  // in: 0011; out: 1010; saved: 1010
  console.log(register.repr());
  
  wenable.off(window);
  
  // in: 0011; out: 0000; saved: 1010
  console.log(register.repr());
}

function RAM(){
  var self = this;
  var undefined;
  
  
  var mem = {};
  
  var pins = new PinGroup(self);
  var inputGroup;
  var outputGroup;
  
  
  self.SET = pins.init('SET', Update);
  self.ENABLE = pins.init('ENABLE', Update);
  
  self.repr = Repr;
  
  
  function Repr(){
    return 'RAM(in: '+inputGroup.read()+'; out: '+outputGroup.read()+'; enabled: '+pins.read('ENABLE')+')';
  }
  
  
  function Update(){
    if(! pins.read('ENABLE'))
      DoClearValue();
    
    if(pins.read('SET'))
      DoSet();
    else if(pins.read('ENABLE'))
      DoEnable();
  }
  function DoEnable(){
    var savedValue = mem[inputGroup.read()];
    if (savedValue === undefined)
      savedValue = 0;
    
    outputGroup.write(savedValue);
  }
  function DoSet(){
    mem[inputGroup.read()] = outputGroup.read();
  }
  function DoClearValue(){
    outputGroup.write(0);
  }
  
  
  (function Constructor(refBitSize, instructions){
    if(refBitSize === undefined)
      throw 'refBitSize required for Register initialization';
    if(instructions === undefined)
      instructions = [];
    
    for(var i=0; i<instructions.length; i++)
      mem[i] = instructions[i];
    
    inputGroup = [];
    outputGroup = [];
    
    var inputConnector = [];
    var outputConnector = [];
    
    for(var i=0; i<refBitSize; i++){
      self['IN'+i] = pins.init('IN'+i, Update);
      self['OUT'+i] = pins.init('OUT'+i, Update);
      inputConnector.push(self['IN'+i]);
      outputConnector.push(self['OUT'+i]);
      inputGroup.push('IN'+i);
      outputGroup.push('OUT'+i);
    }
    
    inputGroup = new BinaryPinGroup(pins, inputGroup);
    outputGroup = new BinaryPinGroup(pins, outputGroup);
    
    self.INPUT = new PinConnector(inputConnector);
    self.OUTPUT = new PinConnector(outputConnector);
  }).apply(self, arguments);
}
function TestRAM(){
  var ram = new RAM(4);
  
  var in0 = new Wire();
  var in1 = new Wire();
  var in2 = new Wire();
  var in3 = new Wire();
  
  var out0 = new Wire();
  var out1 = new Wire();
  var out2 = new Wire();
  var out3 = new Wire();
  
  var wset = new Wire();
  var wenable = new Wire();
  
  var input = new PinConnector([in0, in1, in2, in3]);
  var output = new PinConnector([out0, out1, out2, out3]);
  
  ram.INPUT.connect(input);
  ram.OUTPUT.connect(output);
  
  ram.SET(wset);
  ram.ENABLE(wenable);
  
  // in: 0000; out: 0000
  console.log(ram.repr());
  
  in0.on(window);
  in2.on(window);
  wenable.on(window);
  
  // in: 1010; out: 0000
  console.log(ram.repr());
  
  out0.on(window);
  out1.on(window);
  out2.on(window);
  
  // in: 1010; out: 1110
  console.log(ram.repr());
  
  wset.on(window);
  wset.off(window);
  
  out0.off(window);
  out1.off(window);
  out2.off(window);
  
  // in: 1010; out: 1110
  console.log(ram.repr());
  
  in3.on(window);
  
  // in: 1010; out: 0000
  console.log(ram.repr());
  
  in3.off(window);
  
  // in: 1010; out: 1110
  console.log(ram.repr());
}

function ArithmeticLogicUnit(){
  var self = this;
  
  
  var refBitSize;
  var pins = new PinGroup(self);
  var inputA, inputB, output;
  // controlPins will be replaced with a BinaryPinGroup
  var controlPins = ['CTL0', 'CTL1', 'CTL2', 'CTL3'];
  
  
  self.FLAG0 = pins.init('FLAG0', new Function());
  self.FLAG1 = pins.init('FLAG1', new Function());
  self.FLAG2 = pins.init('FLAG2', new Function());
  self.FLAG3 = pins.init('FLAG3', new Function());
  self.FLAG4 = pins.init('FLAG4', new Function());
  self.FLAG5 = pins.init('FLAG5', new Function());
  self.FLAGS = new PinConnector([
    self.FLAG0,
    self.FLAG1,
    self.FLAG2,
    self.FLAG3,
    self.FLAG4,
    self.FLAG5
  ]);
  
  
  self.repr = Repr;
  
  
  function Repr(){
    return 'ALU(A: '+inputA.read()+'; B: '+inputB.read()+'; OUT: '+output.read()+'; F0: '+pins.read('FLAG0')+'; F1: '+pins.read('FLAG1')+'; F2: '+pins.read('FLAG2')+'; F3: '+pins.read('FLAG3')+'; F4: '+pins.read('FLAG4')+'; F5: '+pins.read('FLAG5')+'; CTL: '+controlPins.read()+')';
  }
  
  
  function Update(){
    ClearFlags();
    
    switch(controlPins.read()){
      case  0: DoAdd(); break;
      case  1: DoSub(); break;
      case  2: DoMul(); break;
      case  3: DoDiv(); break;
      case  4: DoMod(); break;
      case  5: DoCMP(); break;
      case  6: DoLShift(); break;
      case  7: DoRShift(); break;
      case  8: DoAnd(); break;
      case  9: DoOr(); break;
      case 10: DoNot(); break;
      case 11: DoXor(); break;
      case 12: DoAccPass(); break;
      case 13: DoTMPPass(); break;
      case 14: break;
      case 15: break;
    }
    
    CalculateIndependentFlags();
  }
  function ClearFlags(){
    pins.write('FLAG0', 0);
    pins.write('FLAG1', 0);
    pins.write('FLAG2', 0);
    pins.write('FLAG3', 0);
    pins.write('FLAG4', 0);
    pins.write('FLAG5', 0);
  }
  function CalculateIndependentFlags(){
    var A = inputA.read();
    var B = inputB.read();
    var O = output.read();
    
    if (O === 0) pins.write('FLAG1', 1);
    if (A  >  B) pins.write('FLAG5', 1);
    if (A === B) pins.write('FLAG4', 1);
  }
  function WriteOutput(out){
    if (output.write(out))
      pins.write('FLAG0', 1);
  }
  
  function DoAdd(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B + A;
    
    WriteOutput(out);
  }
  function DoSub(){
    var A = inputA.read();
    var B = inputB.read();
    var out = Math.abs(B - A);
    
    if (B - A < 0) pins.write('FLAG2', 1);
    
    WriteOutput(out);
  }
  function DoMul(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B * A;
    
    WriteOutput(out);
  }
  function DoDiv(){
    var A = inputA.read();
    var B = inputB.read();
    
    if (A === 0){
      output.write(0);
      pins.write('FLAG3', 1);
      return;
    }
    
    var out = Math.floor(B / A);
    WriteOutput(out);
  }
  function DoMod(){
    var A = inputA.read();
    var B = inputB.read();
    
    if (A === 0){
      output.write(0);
      pins.write('FLAG3', 1);
      return;
    }
    
    var out = B % A;
    WriteOutput(out);
  }
  function DoCMP(){
    output.write(0);
  }
  function DoLShift(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B << A;
    
    WriteOutput(out);
  }
  function DoRShift(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B >> A;
    
    WriteOutput(out);
  }
  function DoAnd(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B & A;
    
    WriteOutput(out);
  }
  function DoOr(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B | A;
    
    WriteOutput(out);
  }
  function DoNot(){
    var B = inputB.read();
    var filled = (1 << refBitSize) - 1;
    var out = B ^ filled;
    
    WriteOutput(out);
  }
  function DoXor(){
    var A = inputA.read();
    var B = inputB.read();
    var out = B ^ A;
    
    WriteOutput(out);
  }
  function DoAccPass(){
    var B = inputB.read();
    WriteOutput(B);
  }
  function DoTMPPass(){
    var A = inputA.read();
    WriteOutput(A);
  }
  
  
  (function Constructor(_refBitSize){
    if(_refBitSize === undefined)
      throw 'refBitSize required for ALU initialization';
    
    refBitSize = _refBitSize;
    
    inputA = [];
    inputB = [];
    output = [];
    
    var inputAConnector = [];
    var inputBConnector = [];
    var outputConnector = [];
    
    for(var i=0; i<refBitSize; i++){
      self['A'+i] = pins.init('A'+i, Update);
      self['B'+i] = pins.init('B'+i, Update);
      self['OUT'+i] = pins.init('OUT'+i, Update);
      inputA.push('A'+i);
      inputB.push('B'+i);
      output.push('OUT'+i);
      inputAConnector.push(self['A'+i]);
      inputBConnector.push(self['B'+i]);
      outputConnector.push(self['OUT'+i]);
    }
    
    inputA = new BinaryPinGroup(pins, inputA);
    inputB = new BinaryPinGroup(pins, inputB);
    output = new BinaryPinGroup(pins, output);
    
    self.A = new PinConnector(inputAConnector);
    self.B = new PinConnector(inputBConnector);
    self.OUTPUT = new PinConnector(outputConnector);
    
    var controlPinsConnector = [];
    for(var i=0,controlPin; controlPin=controlPins[i++];){
      self[controlPin] = pins.init(controlPin, Update);
      controlPinsConnector.push(self[controlPin]);
    }
    controlPins = new BinaryPinGroup(pins, controlPins);
    self.CTL = new PinConnector(controlPinsConnector);
    
    Update();
  }).apply(self, arguments);
}
function TestArithmeticLogicUnit(){
  var alu = new ArithmeticLogicUnit(3);
  
  var a0 = new Wire();
  var a1 = new Wire();
  var a2 = new Wire();
  
  var b0 = new Wire();
  var b1 = new Wire();
  var b2 = new Wire();
  
  var c0 = new Wire();
  var c1 = new Wire();
  var c2 = new Wire();
  var c3 = new Wire();
  
  var A = new PinConnector([a0, a1, a2]);
  var B = new PinConnector([b0, b1, b2]);
  var CTL = new PinConnector([c0, c1, c2, c3]);
  
  alu.A.connect(A);
  alu.B.connect(B);
  alu.CTL.connect(CTL);
  
  console.log(alu.repr());
  
  // write 3 to CTL
  c0.on(window);
  c1.on(window);
  
  // write 5 to A
  a0.on(window);
  a2.on(window);
  
  // write 2 to B
  b1.on(window);
  
  console.log(alu.repr());
  
  return;
  // past this point haven't made necessary changes
  
  CTL.write(8);
  B.write(3);
  
  console.log(alu.repr());
  
  CTL.write(13);
  
  console.log(alu.repr());
}

function Wire(){
  var self = this;
  
  
  var stat = [];
  var listeners = [];
  
  
  self.on = On;
  self.off = Off;
  self.status = Status;
  
  self.listen = Listen;
  self.unlisten = Unlisten;
  
  
  function On(parent){
    if(stat.indexOf(parent) !== -1)
      return;
    var oldStatus = Status();
    stat.push(parent);
    if (oldStatus != Status())
      PropogateChange();
  }
  function Off(parent){
    var index = stat.indexOf(parent);
    if(index === -1)
      return;
    var oldStatus = Status();
    stat.splice(index, 1);
    if (oldStatus != Status())
      PropogateChange();
  }
  function Status(){
    return stat.length > 0 ? 1 : 0;
  }
  
  function Listen(funct){
    if(listeners.indexOf(funct) !== -1) return;
    listeners.push(funct);
  }
  function Unlisten(funct){
    var index = listeners.indexOf(funct);
    if(index === -1) return;
    listeners.splice(index, 1);
  }
  function PropogateChange(){
    for(var i=0; i<listeners.length; i++)
      listeners[i]();
  }
  
  
  (function Constructor(){}).apply(self, arguments);
}

