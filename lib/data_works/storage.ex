defmodule DataWorks.Storage do
  @moduledoc """
  Storage
  """
  @behaviour DataWorks.StorageBehaviour
  @storage_module Application.get_env(:data_works, :storage_module) 

  defdelegate read!(path), to: @storage_module
end
