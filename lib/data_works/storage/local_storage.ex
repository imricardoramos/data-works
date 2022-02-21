defmodule DataWorks.Storage.LocalStorage do
  @moduledoc """
  Adapter for local storage
  """
  @behaviour DataWorks.StorageBehaviour

  def get!(path) do
    path = Path.join([File.cwd!(), path])
    File.read!(path)
  end

  def get_url!(path) do
    DataWorksWeb.Endpoint.static_path("/#{path}")
  end

  def get_presigned_url!(path) do
    DataWorksWeb.Endpoint.static_path("/#{path}")
  end
end
