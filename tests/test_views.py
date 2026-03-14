import pytest
from datetime import date

from django.shortcuts import reverse
from rest_framework.test import APIClient

from map.models import CommunityArea, RestaurantPermit


EXPECTED_DATA = {
    "Beverly": {"area_id": 1, "num_permits": 2},
    "Lincoln Park": {"area_id": 2, "num_permits": 3},
}


@pytest.mark.django_db
def test_map_data_view():
    # Create some test community areas
    area1 = CommunityArea.objects.create(name="Beverly", area_id="1")
    area2 = CommunityArea.objects.create(name="Lincoln Park", area_id="2")

    # Test permits for Beverly
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 1, 15)
    )
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 2, 20)
    )

    # Test permits for Lincoln Park
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 3, 10)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 2, 14)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 6, 22)
    )

    # Query the map data endpoint
    client = APIClient()
    response = client.get(reverse("map_data", query={"year": 2021}))

    data = response.data

    beverly_item = next((item for item in data if "Beverly" in item), None)
    beverly_data = beverly_item["Beverly"] if beverly_item else None

    lincoln_park_item = next((item for item in data if "Lincoln Park" in item), None)
    lincoln_park_data = lincoln_park_item["Lincoln Park"] if lincoln_park_item else None

    assert beverly_data is not None
    assert lincoln_park_data is not None
    assert beverly_data["num_permits"] == EXPECTED_DATA["Beverly"]["num_permits"]
    assert lincoln_park_data["num_permits"] == EXPECTED_DATA["Lincoln Park"]["num_permits"]
