defmodule DataWorks.Storage do
  @moduledoc """
  Storage
  """
  @behaviour DataWorks.StorageBehaviour
  @storage_module Application.get_env(:data_works, :storage_module) 

  defdelegate get!(path), to: @storage_module
  defdelegate get_url!(path), to: @storage_module
  defdelegate get_presigned_url!(path), to: @storage_module
end
