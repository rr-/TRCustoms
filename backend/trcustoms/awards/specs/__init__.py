from .amulet_of_horus import amulet_of_horus
from .base import AwardSpec
from .bestiary import bestiary
from .bone_dust import bone_dust
from .dragon_statue import dragon_statue
from .dual_pistols import dual_pistols
from .iris import iris
from .philosophers_stone import philosophers_stone
from .sanglyph import sanglyph
from .scion import scion
from .seraph import seraph
from .werners_broken_glasses import werners_broken_glasses

ALL_AWARD_SPECS = [
    *dragon_statue(),
    *amulet_of_horus(),
    *scion(),
    *dual_pistols(),
    *philosophers_stone(),
    *iris(),
    *bestiary(),
    *seraph(),
    *werners_broken_glasses(),
    *bone_dust(),
    *sanglyph(),
]


__all__ = [
    "amulet_of_horus",
    "AwardSpec",
    "bestiary",
    "bone_dust",
    "dragon_statue",
    "dual_pistols",
    "iris",
    "philosophers_stone",
    "sanglyph",
    "scion",
    "seraph",
    "werners_broken_glasses",
]
