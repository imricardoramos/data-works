defmodule DataWorks.Repo do
  use Ecto.Repo,
    otp_app: :data_works,
    adapter: Ecto.Adapters.Postgres
end
