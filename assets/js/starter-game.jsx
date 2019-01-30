import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Game />, root);
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grids: initCards(),
      onGoing: true,
      steps: 0,
      flipped: [],
      matched: 0
    };
  }

  //shuffle the deck and restart
  reset() {
    this.setState({ grids: initCards(), onGoing: true, steps: 0, flipped: [], matched: 0});
  }

  flipCard(idx) {
    let card = this.state.grids[idx];
    if(card.hidden && !card.matched && this.state.flipped.length<2) {
      var newGrid = this.state.grids.slice();
      newGrid[idx].hidden=false;
      var allFlipped = this.state.flipped.slice();
      allFlipped.push(idx);
      var numOfMatch = this.state.matched;
      //2 cards are now flipped
      if(allFlipped.length==2) {
         if(newGrid[allFlipped[0]].value==newGrid[allFlipped[1]].value) {
	    var card1 = newGrid[allFlipped[0]];
            var card2 = newGrid[allFlipped[1]];
	    card1.matched = true;
            card2.matched = true;
	    this.setState({grids: newGrid, matched:numOfMatch+2, flipped: [], steps: this.state.steps+1}, ()=>{this.checkFinish()});
	 }
	 //2 cards have different value,delay unflip
	 else {
            this.setState({grids:newGrid, flipped: allFlipped, steps:this.state.steps+1},()=>{
		    this.schedule()});
	 }

      }
      //only one card is flipped
      else {
	  this.setState({grids: newGrid, flipped:allFlipped, steps:this.state.steps+1});
      }
    }
}

  checkFinish() {
    if(this.state.matched==16 && this.state.onGoing) {
       this.setState({onGoing:false});
    }
  }

  unflip() {
      var idx1 = this.state.flipped[0];
      var idx2 = this.state.flipped[1];
      let card1 = this.state.grids[idx1];
      let card2 = this.state.grids[idx2];
      //if the card is flipped and has not been matched
      if(!card1.hidden && !card1.matched && !card2.hidden && !card2.matched) {
          var deck = this.state.grids.slice();
          deck[idx1].hidden=true;
          deck[idx2].hidden=true;
          this.setState({grid:deck, flipped:[]});
      }
  }

  //set delay for unflip 
  schedule() {
    if(this.state.onGoing && this.state.flipped.length==2) {
       var unflipTime=setTimeout(this.unflip.bind(this),1000);
    }
  }

  render() { 
    var table=[];
    for(var j=0;j<4;j++) {
      var row = _.map(this.state.grids.slice(4*j,4*j+4), (item) => {
	  var key = item.idx;
          return <ShowItems item={item} key={key} flipCard={this.flipCard.bind(this)} />;
      });
      var temp = (<div key={j}>{row}</div>);
      table.push(temp);
    }
    return (
      <div>
        <h1>hw04</h1>
	<RenderStatus steps={this.state.steps} />
        {table}
	<RenderSuccess ongoing={this.state.onGoing}/> 
	<button onClick={() => this.reset()}>reset</button>
      </div>
    );
  }
}

//display cards
function  ShowItems(props) {
  if(props.item.hidden){
      return (
        <span>
          <button class="card" value={props.item.value} onClick={()=>props.flipCard(props.item.idx)}>
              ?
	  </button>
        </span>
      );
  }
  else {
      return (
        <span>
          <button class="card" value={props.item.value} onClick={()=>props.flipCard(props.item.idx)}>
              {props.item.value}
          </button>
        </span>
      );
  }
}
function initCards() {
   var all = ["A", "B", "C", "D", "E", "F", "G", "H"];
    var grid = [];
    all = all.concat(all);
    while (all.length > 0) {
      var rand = Math.floor(Math.random() * all.length);
      var l = grid.length;
      var item = { value: all[rand], hidden: true, matched: false, idx: grid.length};
      grid.push(item);
      all.splice(rand, 1);
    }
    return grid;
}


function RenderStatus(props) {
   return (
      <div>
          <p>steps:{props.steps}</p>
      </div>
   );
}

function RenderSuccess(props) {
	var result="";
  (props.ongoing===true)? result="make a guess!" : result="you win!";
  return (<p>{result}</p>);
}











