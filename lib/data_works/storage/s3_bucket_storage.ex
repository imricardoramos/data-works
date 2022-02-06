defmodule DataWorks.Storage.S3BucketStorage do
  @moduledoc """
  Adapter for storage in S3 bucket
  """
  @behaviour DataWorks.StorageBehaviour

  alias ExAws.S3

  def read!(path) do
    S3.get_object("data-works-storage", path)
    |> ExAws.request!
    |> Map.get(:body)
  end
end
