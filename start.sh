gnome-terminal --window-with-profile=hold -e "./rathole client.toml" --tab -e 'sh -c "cd src; node index.js"' --tab -e 'sh -c "cd sandbox; node index.js"'
