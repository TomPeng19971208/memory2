defmodule Memory.Game do
  #server game state
  def new_game do
    %{
      grids: init_deck(),
      on_going: true,
      steps: 0, 
      flipped: [], 
      matched: 0
    }
  end
  
  #game states that are passed to frontend
  def client_view(game) do
    %{ 
      grids: filter_cards(game.grids),
      on_going: game.on_going, 
      steps: game.steps,
      flipped: game.flipped,
      matched: game.matched
    }
  end

  #create a deck of 16 cards, in which each letter appears twice
  def init_deck() do
    all=["A", "B", "C", "D", "E", "F", "G", "H"];
    all=Enum.shuffle(all++all)
    IO.inspect(all)
    deck_helper(all, [], 0)
  end

  def deck_helper(list, acc, 16) do 
    acc;
  end

  def deck_helper(list,acc,start_idx) do
    new_acc=acc++[%{value: Enum.fetch!(list, start_idx), flipped: false, index: start_idx, matched: false}]
    deck_helper(list, new_acc, start_idx+1)
  end 

  #filter out cards that are not flipped or matched
  #this method is used to generate deck that will be passed to frontend
  def filter_cards(list) do
    Enum.map(list, fn x ->
      if x.flipped or x.matched do
        x
      else 
        %{value: "", flipped: false, index: x.index, matched: false}
      end 
    end)
  end

  #check if two cards hold the same value
  def check_value(deck, idx1, idx2) do
    c1 = Enum.fetch!(deck, idx1)
    c2 = Enum.fetch!(deck, idx2)
    c1.value==c2.value
  end

  #unflip two cards 
  def unflip(game) do
    idx1=hd(game.flipped)
    idx2=Enum.fetch!(game.flipped,1)
    IO.puts(idx1)
    IO.puts(idx2)
    c1=Enum.fetch!(game.grids, idx1)
    c2=Enum.fetch!(game.grids, idx2)
    new_deck=List.replace_at(game.grids,idx1,
            %{value: c1.value, flipped: false, index: idx1, matched: false})    
    new_deck=List.replace_at(new_deck,idx2,
      %{value: c2.value, flipped: false, index: idx2, matched: false})
    game
    |> Map.put(:grids, new_deck)
  end

  #flip a card
  def flip(game, idx) do
    deck=game.grids
    target=Enum.fetch!(deck, idx)
    if !target.flipped or !target.matched do
      l=length(game.flipped)
      
      #no cards have been flipped yet, just flip the card
      if l==0 do
        new_deck=List.replace_at(deck,idx,
          %{value: target.value, flipped: true, index: idx, matched: false})
        game
        |> Map.put(:grids, new_deck)
        |> Map.put(:steps, game.steps+1)
        |> Map.put(:flipped, [idx])
        
      #a card had been flipped, check value and update game state
      else 
        result = check_value(deck, hd(game.flipped), idx)
        #two cards have the same value
        #increament steps, matches, clear flipped, check if the game is finished
        if result do
          first=Enum.fetch!(game.grids, hd(game.flipped))
          new_deck=List.replace_at(deck,idx,          
            %{value: target.value, flipped: true, index: idx, matched: true})
          new_deck=List.replace_at(new_deck, hd(game.flipped),
          %{value: first.value, flipped: true, index: hd(game.flipped), matched: true})
          game
          |>Map.put(:grids, new_deck)
          |>Map.put(:steps, game.steps+1)
          |>Map.put(:flipped, [])
          |>Map.put(:matched, game.matched+2)
          |>Map.put(:on_going, game.matched==16)
        #two cards have different values
        #add idx to flipped, add steps, schedule unflip
        else
          new_deck=List.replace_at(deck,idx,
            %{value: target.value, flipped: true, index: idx, matched: false})
          game  
          |>Map.put(:grids, new_deck)
          |>Map.put(:steps, game.steps+1)
          |>Map.put(:flipped, game.flipped++[idx])
          #    |>unflip()
        end
      end
    end

  end








end
