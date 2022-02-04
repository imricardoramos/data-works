defmodule Mix.Tasks.DataDeploy do
  @moduledoc "Copy /data folder to /priv/staic/"
  @shortdoc "Copy /data folder to /priv/staic/"

  use Mix.Task

  @impl Mix.Task
  def run(_) do
    source = Path.join(File.cwd!(), "data/outputs")
    target = Path.join(File.cwd!(), "priv/static/data")
    File.cp_r!(source, target)
  end
end
