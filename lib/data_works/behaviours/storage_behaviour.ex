defmodule DataWorks.StorageBehaviour do

  @callback get!(String.t()) :: binary()
  @callback get_presigned_url!(String.t()) :: binary()
end
