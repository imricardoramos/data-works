defmodule DataWorks.StorageBehaviour do

  @callback read!(String.t()) :: binary()
end
