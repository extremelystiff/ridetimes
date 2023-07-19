  <script>
        var parkUrls = {
            cedarPoint: 'https://script.google.com/macros/s/AKfycbw9_VDZ0aQ8XLzDceMCfwtYPXa5D9uty4gceJzE0Gi8vr9xIkd519ClK-jbbiPaKtak/exec',
            kingsIsland: 'https://script.google.com/macros/s/AKfycbytrvrhTC3SEidF_QsHD1bIQH6JnI2OUAvAbNC4R7HV_0p49XrMhWSbw2LiDUHbQpDy/exec'
        };

        var weatherUrls = {
            cedarPoint: 'https://forecast7.com/en/41d41n82d69/44870/?unit=us',
            kingsIsland: 'https://forecast7.com/en/39d36n84d31/mason/?unit=us'
        };

        var parkNames = {
            cedarPoint: 'SANDUSKY',
            kingsIsland: 'MASON'
        };


        function getGradientColor(minute) {
            if (minute < 21) return localStorage.getItem('lowWaitColor') || '#008000';
            else if (minute < 60) return localStorage.getItem('mediumWaitColor') || '#FFFF00';
            else if (minute < 120) return localStorage.getItem('highWaitColor') || '#FFA500';
            else return localStorage.getItem('extremeWaitColor') || '#FF0000';
        }

        document.getElementById('settingsButton').addEventListener('click', function() {
            document.getElementById('settings').style.display = "block";
        });

        document.getElementById('applyColors').addEventListener('click', function() {
            var favoriteColor = document.getElementById('favoriteColor').value;
            var lowWaitColor = document.getElementById('lowWaitColor').value;
            var mediumWaitColor = document.getElementById('mediumWaitColor').value;
            var highWaitColor = document.getElementById('highWaitColor').value;
            var extremeWaitColor = document.getElementById('extremeWaitColor').value;
			var rideTextColor = document.getElementById('rideTextColor').value;
			var rideBgColor = document.getElementById('rideBgColor').value;
            
            localStorage.setItem('favoriteColor', favoriteColor);
            localStorage.setItem('lowWaitColor', lowWaitColor);
            localStorage.setItem('mediumWaitColor', mediumWaitColor);
            localStorage.setItem('highWaitColor', highWaitColor);
            localStorage.setItem('extremeWaitColor', extremeWaitColor);
			localStorage.setItem('rideTextColor', rideTextColor);
			localStorage.setItem('rideBgColor', rideBgColor);

			document.documentElement.style.setProperty('--favorite-color', favoriteColor);
			document.documentElement.style.setProperty('--ride-text-color', rideTextColor);
			document.documentElement.style.setProperty('--ride-bg-color', rideBgColor);
            document.getElementById('settings').style.display = "none";
        });

        document.getElementById('resetColors').addEventListener('click', function() {
            localStorage.clear();
            location.reload();
        });

		window.onload = function() {
			document.getElementById('favoriteColor').value = localStorage.getItem('favoriteColor') || '#FFD700';
			document.getElementById('lowWaitColor').value = localStorage.getItem('lowWaitColor') || '#008000';
			document.getElementById('mediumWaitColor').value = localStorage.getItem('mediumWaitColor') || '#FFFF00';
			document.getElementById('highWaitColor').value = localStorage.getItem('highWaitColor') || '#FFA500';
			document.getElementById('extremeWaitColor').value = localStorage.getItem('extremeWaitColor') || '#FF0000';
			document.getElementById('rideTextColor').value = localStorage.getItem('rideTextColor') || '#ffffff';
			document.getElementById('rideBgColor').value = localStorage.getItem('rideBgColor') || '#000000';

			var favoriteColor = localStorage.getItem('favoriteColor') || '#FFD700';
			var rideTextColor = localStorage.getItem('rideTextColor') || '#ffffff';
			var rideBgColor = localStorage.getItem('rideBgColor') || '#000000';

			document.documentElement.style.setProperty('--favorite-color', favoriteColor);
			document.documentElement.style.setProperty('--ride-text-color', rideTextColor);
			document.documentElement.style.setProperty('--ride-bg-color', rideBgColor);
		};



	 function displayWaitTimes(park) {
            setTimeout(function() {
                $.getJSON(parkUrls[park], function (data) {
                    var jsonData = data;
                    var rides = jsonData.lands.reduce(function(acc, land) {
                        return acc.concat(land.rides);
                    }, []);

                    var favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];

                    // Filter favorite rides
                    var favoriteRides = rides.filter(function(ride) {
                        return favorites.indexOf(ride.id) > -1;
                    });

                    // Sort favorite rides alphabetically by name
                    favoriteRides.sort(function(a, b) {
                        return a.name.localeCompare(b.name);
                    });

                    // Filter non-favorite rides
                    var nonFavoriteRides = rides.filter(function(ride) {
                        return favorites.indexOf(ride.id) === -1;
                    });

                    // Sort non-favorite rides based on wait time and name
                    nonFavoriteRides.sort(function(a, b) {
                        if (!a.is_open && b.is_open) return 1;
                        if (a.is_open && !b.is_open) return -1;
                        if (a.wait_time === 0 && b.wait_time !== 0) return 1;
                        if (b.wait_time === 0 && a.wait_time !== 0) return -1;
                        if (a.wait_time === b.wait_time) return a.name.localeCompare(b.name);
                        return b.wait_time - a.wait_time;
                    });

                    // Concatenate favorite and non-favorite rides
                    var sortedRides = favoriteRides.concat(nonFavoriteRides);

                    $('#data').empty();
                    sortedRides.forEach(function(ride) {
                        var waitTime = ride.is_open ? (ride.wait_time === 0 ? 'Walk-on' : ride.wait_time + ' min') : 'Closed';
                        var statusColor = ride.is_open ? (ride.wait_time === 0 ? 'blue' : getGradientColor(ride.wait_time)) : 'red';

                        // Check if the ride is favorited
                        var isFavorite = favorites.indexOf(ride.id) > -1;
                        var favoriteIcon = isFavorite ? '&#9733;' : '&#9734;';

						$('#data').append(`
							<div class="ride" data-ride-id="${ride.id}">
								<span class="ride-name">
									<span class="favorite">${favoriteIcon}</span>
									${ride.name}
								</span>
								<span class="ride-time" style="color: ${statusColor};">${waitTime}</span>
							</div>
						`);
                    });
					$('.ride .favorite').on('click', function() {
						var rideId = $(this).parent().parent().data('ride-id');
						toggleFavorite(rideId);
					});
                }).fail(function() {
                    $('#error').text('Failed to fetch ride data.');
                });
            }, 0);
        }

        function updateWeather(park) {
            $('.weatherwidget-io')
                .attr('href', weatherUrls[park])
                .text(parkNames[park] + ' WEATHER');
        }

        function selectPark(park) {
            sessionStorage.setItem('selectedPark', park);
            updateWeather(park);
            displayWaitTimes(park);
        }

		function toggleFavorite(rideId) {
			var favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];

			// If the ride is already favorited, remove it from the favorites
			if (favorites.indexOf(rideId) > -1) {
				favorites = favorites.filter(function(id) {
					return id !== rideId;
				});
			}
			// If the ride is not favorited, add it to the favorites
			else {
				favorites.push(rideId);
			}

			sessionStorage.setItem('favorites', JSON.stringify(favorites));

			// Refresh the ride list to reflect the changes
			var selectedPark = sessionStorage.getItem('selectedPark') || 'cedarPoint';
			displayWaitTimes(selectedPark);
		}

        $(document).ready(function() {
            var selectedPark = sessionStorage.getItem('selectedPark') || 'cedarPoint';
            selectPark(selectedPark);

            $('#cedarPointButton').click(function() {
                $(this).addClass('active');
                $('#kingsIslandButton').removeClass('active');
                selectPark('cedarPoint');
            });

            $('#kingsIslandButton').click(function() {
                $(this).addClass('active');
                $('#cedarPointButton').removeClass('active');
                selectPark('kingsIsland');
            });
        });
    </script>
