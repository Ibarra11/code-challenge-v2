from rest_framework import serializers

from map.models import CommunityArea, RestaurantPermit


class CommunityAreaListSerializer(serializers.ListSerializer):
    def to_representation(self, data):
        result = []
        for item in data:
            child_data = self.child.to_representation(item)
            name = child_data["name"]
            result.append({name: {"area_id": child_data["area_id"], "num_permits": child_data["num_permits"]}})
        return result


class CommunityAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityArea
        fields = ["name", "area_id", "num_permits"]
        list_serializer_class = CommunityAreaListSerializer

    num_permits = serializers.SerializerMethodField()

    def get_num_permits(self, obj):
        area_id = obj.area_id
        num_permits = RestaurantPermit.objects.filter(community_area_id=area_id, issue_date__year=self.context["year"]).count()
        return num_permits
     
       
     
