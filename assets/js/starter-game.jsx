import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

export default function game_init(root, channel) {
  ReactDOM.render(<Game channel={channel} />, root);
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grids: [],
      on_going: true,
      steps: 0,
      flipped: [],
      matched: 0
    };
    this.channel = props.channel;
    this.channel
      .join()
      .receive("ok", this.init_state.bind(this))
      .receive("error", resp => {
        console.log(resp);
      });
  }

  init_state(props) {
    this.setState(props.game);
  }

  flipCard(idx) {
    this.channel
      .push("flip", { index: idx })
      .receive("ok", this.init_state.bind(this));
    this.schedule();
  }

  reset() {
    this.channel.push("restart").receive("ok", this.init_state.bind(this));
  }

  unflip() {
    this.channel.push("unflip").receive("ok", this.init_state.bind(this));
  }

  //set delay for unflip
  schedule() {
    if (this.state.onGoing && this.state.flipped.length == 2) {
      var unflipTime = setTimeout(this.unflip.bind(this), 1000);
    }
  }

  render() {
    var table = [];
    for (var j = 0; j < 4; j++) {
      var row = _.map(this.state.grids.slice(4 * j, 4 * j + 4), item => {
        var key = item.index;
        return (
          <ShowItems
            item={item}
            key={key}
            flipCard={this.flipCard.bind(this)}
          />
        );
      });
      var temp = <div key={j}>{row}</div>;
      table.push(temp);
    }
    return (
      <div>
        <h1>hw04</h1>
        <RenderStatus steps={this.state.steps} />
        {table}
        <RenderSuccess ongoing={this.state.onGoing} />
        <button onClick={() => this.reset()}>reset</button>
      </div>
    );
  }
}

//display cards
function ShowItems(props) {
  if (props.item.value == "") {
    return (
      <span>
        <button class="card" onClick={() => props.flipCard(props.item.index)}>
          ?
        </button>
      </span>
    );
  } else {
    return (
      <span>
        <button class="card" onClick={() => props.flipCard(props.item.index)}>
          {props.item.value}
        </button>
      </span>
    );
  }
}

function RenderStatus(props) {
  return (
    <div>
      <p>steps:{props.steps}</p>
    </div>
  );
}

function RenderSuccess(props) {
  var result = "";
  props.ongoing === true ? (result = "make a guess!") : (result = "you win!");
  return <p>{result}</p>;
}
