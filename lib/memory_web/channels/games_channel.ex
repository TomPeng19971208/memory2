defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel
  alias Memory.Game

  def join("games:"<> name, payload, socket) do
    if authorized?(payload) do
      game = Game.new_game()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (games:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  #when a card is clicked
  def handle_in("flip", %{"index" => idx}, socket) do
    game = socket.assigns[:game]
    game = Game.flip(game, idx)
    socket = assign(socket, :game, game)
    if length(game.flipped)==2 do
      {:reply, {:schedule, %{"game" => Game.client_view(game)}}, socket}
    else
      {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
    end
  end


  #when restart is clicked
  def handle_in("restart", payload, socket) do
    game = Game.new_game()
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("unflip", payload, socket) do
    game = socket.assigns[:game]
    game = Game.unflip(game)
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end

end
