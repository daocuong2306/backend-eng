{ pkgs, ... }: {

  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.yarn-berry
    pkgs.nodejs_20
    pkgs.gcc
    pkgs.fish
      ];

  # Sets environment variables in the workspace
  # env = {
  #   SOME_ENV_VAR = "hello";
  # };

  # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
#   idx.extensions = [
#     "angular.ng-template"
#   ];

  # Enable previews and customize configuration
  idx.previews = {
    enable = false;
    previews = [
      {
        command = [
          "yarn"
          "npm"
          "run"
          "start"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
          "--disable-host-check"
        ];
        manager = "web";
        id = "web";
      }
    ];
  };
}