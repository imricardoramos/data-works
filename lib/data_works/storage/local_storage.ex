defmodule DataWorks.Storage.LocalStorage do
  @moduledoc """
  Adapter for local storage
  """
  @behaviour DataWorks.StorageBehaviour

  def read!(path) do
    path = Path.join([File.cwd!(), path])
    File.read!(path)
  end
end
