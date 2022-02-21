defmodule DataWorks.Storage.S3BucketStorage do
  @moduledoc """
  Adapter for storage in S3 bucket
  """
  @behaviour DataWorks.StorageBehaviour
  @bucket "data-works-storage"

  alias ExAws.S3

  def get!(path) do
    S3.get_object(@bucket, path)
    |> ExAws.request!
    |> Map.get(:body)
  end

  def get_url!(path) do
    "https://s3.amazonaws.com/#{@bucket}/#{path}"
  end

  def get_presigned_url!(path) do
    {:ok, url} = 
      ExAws.Config.new(:s3)
      |> S3.presigned_url(:get, @bucket, path)
    url
  end
end
